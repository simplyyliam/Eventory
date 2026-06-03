import { createSlug } from '@app/shared';
import express from 'express';
import cors from 'cors';
import { Event } from './types';

const events: Event[] = [];

const app = express();
app.use(cors());
app.use(express.json());

// Creating events
app.get('/', (_, res) => {
  res.json({ status: 'server running' });
});

app.post('/events', (req, res) => {
  const data = req.body;

  const now = new Date().toISOString();

  const newEvent: Event = {
    id: crypto.randomUUID(),
    name: data.eventName,
    slug: data.slug || createSlug(data.eventName),
    status: 'draft',

    createdAt: now,
    updatedAt: now,

    guests: data.guests ?? [],
    seatedGuests: data.seatedGuests ?? [],
    tables: data.tables ?? [],
  };

  events.push(newEvent);

  res.json(newEvent);
});

// Listing events
app.get('/events', (_, res) => {
  res.json(events);
});

// Getting events
app.get('/events/:slug', (req, res) => {
  const { slug } = req.params;

  const event = events.find((e) => e.slug === slug);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});

app.listen(3001, () => {
  console.log('Server running on https://localhost:3001☕');
});
