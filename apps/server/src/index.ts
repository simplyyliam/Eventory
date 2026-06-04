import { createSlug } from '@app/shared';
import express from 'express';
import cors from 'cors';
import { Event } from './types';

const events: Event[] = [];

const PORT = process.env.PORT || 3001

const app = express();
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:5173', // First local Vite app
    'http://localhost:5174', // Second local Vite app (when running concurrently)
    'https://eventory-guest-app.vercel.app',
    'https://eventory-planner-app.vercel.app'
  ]
}));

// Creating events
app.get('/', (_, res) => {
  res.json({ status: 'server running' });
});

app.post('/events', (req, res) => {
  const data = req.body;
  const eventData = data.event ?? data.events ?? {};
  const eventName =
    eventData.name ?? eventData.eventName ?? data.eventName ?? data.name;

  if (typeof eventName !== 'string' || eventName.trim().length === 0) {
    return res.status(400).json({ error: 'Event name is required' });
  }

  const now = new Date().toISOString();
  const name = eventName.trim();
  const slug = eventData.slug ?? data.slug ?? createSlug(name);

  const newEvent: Event = {
    id: eventData.id ?? crypto.randomUUID(),
    name,
    slug,
    status: eventData.status ?? 'draft',

    createdAt: eventData.createdAt ?? now,
    updatedAt: now,

    guests: data.guests ?? [],
    seatedGuests: data.seatedGuests ?? [],
    tables: data.tables ?? [],
    metadata: data.metadata ?? eventData.metadata,
  };

  console.log("🚀 Created Event:");
  console.dir(newEvent, { depth: null }); // ensures I see everything using .dir

  events.push(newEvent);

  res.status(201).json(newEvent);
});

// Listing events
app.get('/events', (_, res) => {
  res.json(events);
});

// Getting events
app.get('/events/:slug', (req, res) => {
  const { slug } = req.params;

  const event = events.find((e) => e.slug === slug || e.slug === createSlug(slug));

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:3001');
});
