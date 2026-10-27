// In-memory stand-in for apps/server so the UI can be exercised without touching production.
import http from 'node:http';
import { randomUUID } from 'node:crypto';

const slugify = (n) => n.toLowerCase().trim().replace(/\s+/g, '-');
const now = () => new Date().toISOString();
const inDays = (d) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);

const names = ['Amara Okafor','Theo Lindqvist','Priya Raman','Jonah Weiss','Lucia Romero','Kenji Watanabe','Fatima Haddad','Oliver Grant','Sofia Marino','Daniel Kim','Hannah Muller','Mateo Silva','Grace Liu','Noah Becker','Zara Ahmed','Ethan Brooks','Mila Novak','Samuel Osei','Chloe Martin','Leo Fischer','Ava Thompson','Ibrahim Yusuf','Nora Jensen','Lucas Moreau','Ella Hughes','Ravi Patel','Isla Murphy','Hugo Laurent','Maya Cohen','Felix Wagner','Layla Hassan','Arjun Mehta'];
const diets = [[],[],[],['Vegetarian'],[],['Vegan'],[],['Gluten-free'],[],[],['Halal'],[],['Nut allergy'],[],['Vegetarian'],[]];

function seedEvent(name, opts) {
  const id = randomUUID();
  const tables = opts.tables.map((t, i) => ({ id: randomUUID(), name: `Table ${i + 1}`, tableNumber: i + 1, seatCount: t.seats, shape: t.shape, textureId: 'white-oak', width: 150, height: t.height ?? 320, x: t.x, y: t.y, rotation: 0, hiddenSeats: [], linkedTableId: null, eventId: id }));
  const guests = names.slice(0, opts.guests).map((n, i) => {
    const seatedAt = i < opts.seated ? tables[i % tables.length] : null;
    const seatIndex = seatedAt ? Math.floor(i / tables.length) + 1 : null;
    return { id: randomUUID(), name: n, email: `${n.split(' ')[0].toLowerCase()}@example.com`, dietary: diets[i % diets.length], comments: null, status: i % 7 === 3 ? 'declined' : i % 5 === 1 ? 'pending' : 'confirmed', seat: seatedAt ? `${seatedAt.id}-seat-${seatIndex}` : null, tableId: seatedAt?.id ?? null, eventId: id };
  });
  return { id, name, slug: slugify(name), status: opts.status, metadata: opts.metadata, createdAt: now(), updatedAt: now(), tables, guests };
}

const events = [
  seedEvent('Amara & Theo Wedding', {
    status: 'published', guests: 32, seated: 18,
    metadata: { date: inDays(12), startTime: '16:00', venueName: 'The Glasshouse, Kew', address: '12 Garden Row, London', welcomeMessage: 'We are so glad you are here. Find your table, grab a drink, and settle in.', contactEmail: 'hello@example.com' },
    tables: [{ shape: 'circle', seats: 8, x: -600, y: -300 }, { shape: 'circle', seats: 8, x: 0, y: -300 }, { shape: 'circle', seats: 8, x: 600, y: -300 }, { shape: 'rectangle', seats: 8, x: 0, y: 400, height: 320 }],
  }),
  seedEvent('Northwind Annual Dinner', { status: 'draft', guests: 14, seated: 0, metadata: { date: inDays(45), venueName: 'Riverside Hall' }, tables: [] }),
  seedEvent('Spring Fundraiser', { status: 'draft', guests: 8, seated: 8, metadata: { date: inDays(-20) }, tables: [{ shape: 'circle', seats: 8, x: 0, y: 0 }] }),
  seedEvent('Grandma Rose 80th', { status: 'draft', guests: 0, seated: 0, metadata: null, tables: [] }),
];

const send = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
  res.end(body === undefined ? '' : JSON.stringify(body));
};
const readBody = (req) => new Promise((r) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => r(d ? JSON.parse(d) : {})); });
const bySlug = (s) => events.find((e) => e.slug === s);
const publicGuest = (g) => ({ id: g.id, name: g.name, status: g.status, seat: g.seat, tableId: g.tableId });

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204);
  const url = new URL(req.url, 'http://x');
  const p = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  await delay(250);
  console.log(req.method, url.pathname);

  if (req.method === 'GET' && p[0] === 'internal' && p[1] === 'events' && !p[2]) return send(res, 200, [...events].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  if (p[0] === 'internal' && p[1] === 'events' && p[2]) {
    const e = bySlug(p[2]);
    if (!e) return send(res, 404, { error: 'Event not found' });
    if (req.method === 'GET') return send(res, 200, e);
    if (req.method === 'PATCH') {
      const b = await readBody(req);
      if (b.name) e.name = b.name;
      if (b.metadata) e.metadata = b.metadata;
      if (b.tables) e.tables = b.tables.map((t) => ({ ...t, eventId: e.id }));
      if (b.guests) e.guests = b.guests.map((g) => ({ ...g, eventId: e.id, tableId: g.tableId && e.tables.some((t) => t.id === g.tableId) ? g.tableId : null }));
      e.updatedAt = now();
      return send(res, 200, e);
    }
  }
  if (req.method === 'POST' && p[0] === 'events' && p[1] === 'create') {
    const b = await readBody(req);
    if (bySlug(slugify(b.name))) return send(res, 409, { error: 'exists' });
    const e = { id: randomUUID(), name: b.name, slug: slugify(b.name), status: 'draft', metadata: null, createdAt: now(), updatedAt: now(), tables: [], guests: [] };
    events.push(e);
    return send(res, 201, e);
  }
  if (p[0] === 'events' && p[1] && !p[2]) {
    const e = bySlug(p[1]);
    if (!e) return send(res, 404, { error: 'nf' });
    if (req.method === 'PATCH') {
      const b = await readBody(req);
      if (b.name) { e.name = b.name; e.slug = slugify(b.name); }
      if (b.status) e.status = b.status;
      if (b.metadata) e.metadata = b.metadata;
      e.updatedAt = now();
      const { tables, guests, ...rest } = e;
      return send(res, 200, rest);
    }
    if (req.method === 'DELETE') { events.splice(events.indexOf(e), 1); return send(res, 204); }
  }
  if (req.method === 'GET' && p[0] === 'public' && p[1] === 'events') {
    const e = bySlug(p[2]);
    if (!e || e.status !== 'published') return send(res, 404, { error: 'Event not found' });
    if (p[3] === 'guests') {
      const g = e.guests.find((x) => x.id === p[4]);
      if (!g) return send(res, 404, { error: 'nf' });
      return send(res, 200, { ...publicGuest(g), table: e.tables.find((t) => t.id === g.tableId) ?? null });
    }
    return send(res, 200, { ...e, guests: e.guests.filter((g) => g.status !== 'declined').map(publicGuest) });
  }
  send(res, 404, { error: 'no route' });
}).listen(3010, () => console.log('mock api on 3010'));
