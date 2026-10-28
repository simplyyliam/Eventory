# Overhaul progress (save point)

If you're a new session continuing the overhaul goal: read `CLAUDE.md`, `DECISIONS.md`, `docs/DESIGN.md`, then pick up the first unchecked item below. Each item is its own branch merged into `main` with `--no-ff`.

## User design direction (keep applying)

- Match `docs/design/(1) History _ X (1).jpg` closely: default (not inset) sidebar with hairline divider, event switcher at the top of the sidebar (no Eventory logo row), breadcrumb top bar with the current page as a grey chip, neutral greys, small radii, compact pills.
- Flat / soft-minimal icons and marks only. No gradients or bevels.
- Dark theme base is `#0a0a0a`.
- Tiny, subtle interaction details everywhere (see docs/DESIGN.md), never playful.
- Floor plan must stay 60fps: sprites + cached table bitmaps, no live canvas shadows, hit graph paused while panning/zooming.

## Done

- [x] `chore/foundation`: tokens, shared primitive retune, domain layer, workspace store (zundo), autosave, shell, sidebar, ⌘K menu, server RSVP/privacy fixes, docs
- [x] `feat/dashboard`: home summary sentence + event list, event overview (stats, needs attention, checklist, tables, dietary)

## To do (in order)

- [x] `feat/floor-plan-editor`: react-konva editor, contents panel (drag/click to add), guests tab + drag-to-seat + auto-seat, inspector, guides/snap/marquee, sprites + bitmap caching for perf; shell retuned to the History reference

- [x] `feat/guests`: list with search, RSVP/seating filters (URL params), inline RSVP menu, bulk bar, add/edit dialog with dietary tags, XLSX/CSV import with column detection + template, CSV export sorted by table
- [x] `feat/share-settings`: publish switch (status PATCH), link + QR download, printable A–Z seating chart + per-table pages; settings rows for name (rename), date/time, venue, room size, welcome message, RSVP deadline, contact, delete
- [x] `feat/visualizer`: R3F scene from the workspace store (clay cut-away walls, oak floor, instanced chairs + seated figures, tables by finish, venue elements), Matterport-style navigation via CameraControls only (orbit / walk: drag to look + click floor / fly: drag + scroll), frosted table card + camera focus, day/evening, labels/people toggles. Perf: frameloop demand, shadows on demand, 2 lights max, full native DPR (user does NOT want quality reduced, and does NOT want game-like WASD/pointer-lock)
- [x] `feat/3d-assets`: Poly Haven CC0 dining_chair_02 + potted_plant_02, simplified with gltf-transform (chair 22k → 2.6k tris), chair still one InstancedMesh. Credits in public/models/CREDITS.txt

- [ ] `feat/guest-app`: mobile overhaul from the mobile references (cream background, serif display, mono labels, bottom sheet). Find yourself by name, then a ticket with table, seat, tablemates, a mini floor plan highlighting the table, and the welcome message from `metadata.welcomeMessage`.
- [ ] Final pass: `pnpm planner-app build`, `pnpm guest-app build`, update docs, remove dead files (`apps/planner-app/public/textures`, old shared custom components if unused)

## Testing without production

`apps/planner-app/.env.local` points at the live API. For local testing, run the in-memory mock (`node scripts/mock-api.mjs`, port 3010) and start Vite with `VITE_API_URL=http://localhost:3010`.
