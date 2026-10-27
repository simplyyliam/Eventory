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

- [ ] `feat/guests`: guests page (search, filter by RSVP/seated/table, bulk select, RSVP change, inline edit sheet, add, CSV/XLSX import with column preview, CSV export by table)
- [ ] `feat/share-settings`: share page (publish toggle = status change, link, QR download, print-ready seating list) and settings page (name/rename, date, time, venue, address, welcome message, RSVP deadline, contact, room size, danger zone)
- [ ] `feat/visualizer`: `features/visualizer/` with R3F + drei
  - Room from `venue.room`, clay walls cut away, wood floor, Lightformer lighting, contact shadows
  - Tables/chairs/elements from the same geometry (units / 200 = metres), seated guests as soft figures
  - Modes: orbit (CameraControls), walk and fly (PointerLock + WASD; fly adds Space/Shift)
  - Floating islands: mode switch, view presets (top / isometric / entrance), day/evening lighting, labels toggle, back to 2D
  - Click a table: frosted drei `<Html>` card with name, seated/capacity, guest names, dietary notes
  - Read-only. No editing in 3D.
- [ ] `feat/guest-app`: mobile overhaul from the mobile references (cream background, serif display, mono labels, bottom sheet). Find yourself by name, then a ticket with table, seat, tablemates, a mini floor plan highlighting the table, and the welcome message from `metadata.welcomeMessage`.
- [ ] Final pass: `pnpm planner-app build`, `pnpm guest-app build`, update docs, remove dead files (`apps/planner-app/public/textures`, old shared custom components if unused)

## Testing without production

`apps/planner-app/.env.local` points at the live API. For local testing, run the in-memory mock (`node scripts/mock-api.mjs`, port 3010) and start Vite with `VITE_API_URL=http://localhost:3010`.
