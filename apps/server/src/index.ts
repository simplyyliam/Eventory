import 'dotenv/config';
import { createSlug } from '@app/shared';
import express from 'express';
import cors from 'cors';
import { prisma } from '@app/database';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://eventory-guest-app.vercel.app/',
      'https://eventory-planner-app.vercel.app',
      'https://eventory-tan.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

app.get('/', (_, res) => {
  res.json({ status: 'server running' });
});

// Create event
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

  // Remap slug-based table IDs to real UUIDs
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
    };
  });

  // Merge seatedGuests back onto guests
  const seatedMap = new Map<string, { tableId: string; seatId: string }>();
  for (const s of data.seatedGuests ?? []) {
    seatedMap.set(s.guestId, { tableId: s.tableId, seatId: s.seatId });
  }

  const guests = (data.guests ?? []).map((g: any) => {
    const seated = seatedMap.get(g.id);
    const realTableId = seated ? tableIdMap.get(seated.tableId) : null;
    return {
      name: g.Name ?? g.name,
      email: g.Email ?? g.email ?? null,
      dietary: g.Dietary ?? g.dietary ?? [],
      comments: g.Comments ?? g.comments ?? null,
      status: seated ? 'confirmed' : 'pending',
      seat: seated?.seatId ?? null,
      tableId: realTableId ?? null,
    };
  });

  try {
    const event = await prisma.event.create({
      data: {
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

    console.log('🚀 Created Event:');
    console.dir(event, { depth: null });

    res.status(201).json(event);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res
        .status(409)
        .json({ error: 'Event with this slug already exists' });
    }
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

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});
