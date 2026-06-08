import 'dotenv/config';
import { createSlug } from '@app/shared';
import express from 'express';
import cors from 'cors';
import { prisma } from '@app/database';
import guestRoutes from "./routes/guests"

const PORT = process.env.PORT || 3001;
const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://eventory-guest-app.vercel.app',
      'https://eventory-planner-app.vercel.app',
      'https://eventory-tan.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());


// Get guest
app.use('/guests', guestRoutes)

app.get('/', (_, res) => {
  res.json({ status: 'server running' });
});

// ─── Events ───────────────────────────────────────────────────────────────────

// Create empty event
app.post('/events/create', async (req, res) => {
  const { name } = req.body
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Event name is required' })
  }
  const slug = createSlug(name.trim())
  try {
    const event = await prisma.event.create({
      data: {
        name: name.trim(),
        slug,
        status: 'draft',
      }
    })
    res.status(201).json(event)
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Event with this slug already exists' })
    }
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// Publish event (full upsert with tables and guests)
app.post('/events', async (req, res) => {
  const data = req.body;
  const eventData = data.event ?? data.events ?? {};
  const eventName =
    eventData.name ?? eventData.eventName ?? data.eventName ?? data.name;

  if (typeof eventName !== 'string' || eventName.trim().length === 0) {
    return res.status(400).json({ error: 'Event name is required' });
  }

  const name = eventName.trim();
  const slug = eventData.slug ?? data.slug ?? createSlug(name);

  const tableIdMap = new Map<string, string>();
  const tables = (data.tables ?? []).map((t: any) => {
    const newId = crypto.randomUUID();
    tableIdMap.set(t.id, newId);
    return {
      id: newId,
      name: t.name,
      tableNumber: t.tableNumber,
      seatCount: t.seatCount,
      shape: t.shape,
      textureId: t.textureId,
      x: t.x ?? 0,
      y: t.y ?? 0,
      rotation: t.rotation ?? 0,
    };
  });

  const seatedMap = new Map<string, { tableId: string; seatId: string }>();
  for (const s of data.seatedGuests ?? []) {
    seatedMap.set(s.guestId, { tableId: s.tableId, seatId: s.seatId });
  }

  const guests = (data.guests ?? []).map((g: any) => {
    const seated = seatedMap.get(g.id);
    const oldTableId = g.tableId ?? seated?.tableId ?? null;
    const realTableId = oldTableId ? tableIdMap.get(oldTableId) ?? null : null;

    let seat = g.seat ?? seated?.seatId ?? null;
    if (seat && oldTableId && realTableId) {
      seat = seat.replace(oldTableId, realTableId);
    }

    return {
      name: g.name ?? g.Name,
      email: g.email ?? g.Email ?? null,
      dietary: g.dietary ?? g.Dietary ?? [],
      comments: g.comments ?? g.Comments ?? null,
      status: realTableId ? 'confirmed' : 'pending',
      seat,
      tableId: realTableId,
    };
  });

  try {
    const event = await prisma.event.upsert({
      where: { slug },
      update: {
        name,
        status: eventData.status ?? 'draft',
        metadata: data.metadata ?? eventData.metadata,
        updatedAt: new Date(),
        tables: { deleteMany: {}, create: tables },
        guests: { deleteMany: {}, create: guests },
      },
      create: {
        id: eventData.id ?? crypto.randomUUID(),
        name,
        slug,
        status: eventData.status ?? 'draft',
        metadata: data.metadata ?? eventData.metadata,
        tables: { create: tables },
        guests: { create: guests },
      },
      include: { tables: true, guests: true },
    });

    console.log('🚀 Upserted Event:');
    console.dir(event, { depth: null });

    res.status(201).json(event);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// List events
app.get('/events', async (_, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { tables: true, guests: true },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Update event
app.patch('/events/:slug', async (req, res) => {
  const { slug } = req.params
  const { name, status, metadata } = req.body
  console.log('PATCH /events/:slug', slug, req.body)
  try {
    const event = await prisma.event.update({
      where: { slug },
      data: {
        ...(name && { name, slug: createSlug(name) }),
        ...(status && { status }),
        ...(metadata && { metadata }),
        updatedAt: new Date(),
      }
    })
    res.json(event)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// Get event by slug
app.get('/events/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const event = await prisma.event.findFirst({
      where: { slug },
      include: { tables: true, guests: true },
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});


// Delete event
app.delete('/events/:slug', async (req, res) => {
  const { slug } = req.params
  try {
    await prisma.event.delete({ where: { slug } })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

// ─── Tables ───────────────────────────────────────────────────────────────────

// Update table
app.patch('/tables/:tableId', async (req, res) => {
  const { tableId } = req.params
  const { name } = req.body
  console.log('PATCH /tables/:tableId', tableId, req.body)
  try {
    const table = await prisma.table.update({
      where: { id: tableId },
      data: { ...(name && { name }) },
    })
    res.json(table)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update table' })
  }
})

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});