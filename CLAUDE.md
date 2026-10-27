# Eventory

Event planning monorepo. Planners build a seating plan; guests scan a QR code and find their table.

## Layout

| Path | What |
| --- | --- |
| `apps/planner-app` | The planner (React 19, Vite, Tailwind 4). Dashboard, floor plan editor, guests, 3D view. |
| `apps/guest-app` | Mobile page guests open from the QR code. Read-only, published events only. |
| `apps/server` | Express API over Prisma/Postgres. Deployed on Render. |
| `packages/database` | Prisma schema and client. |
| `shared` | shadcn/Base UI primitives and helpers used by both apps (`@app/shared`). |
| `apps/display-app` | Older venue display screen. Not maintained. |

## Commands

```sh
pnpm install
pnpm planner-app dev        # http://localhost:5173
pnpm guest-app dev
pnpm server dev             # needs DATABASE_URL in apps/server/.env
pnpm planner-app build      # tsc + vite build, run before merging
```

`VITE_API_URL` points the apps at the API (defaults to `http://localhost:3001`).

## Planner app architecture

```
src/
  app/          shell, router, sidebar, command menu
  domain/       pure TS: types, seat geometry, stats, auto-seat, server <-> domain mapping
  store/        workspace store (zustand + zundo undo history) and autosave
  lib/          api client, react-query hooks, theme
  components/   small shared UI (pills, rolling numbers, layout helpers)
  features/     one folder per screen: dashboard, overview, floor-plan, guests, visualizer, share, settings
```

- **The workspace store is the single source of truth for the open event.** Tables, guests and the venue layout live in `store/workspace.ts`. The 2D editor and the 3D view both render from it, so they can't drift apart.
- **Geometry lives in `domain/geometry.ts`.** Seat positions, table sizes and chair angles are computed there and nowhere else. Plan units are 200 per metre.
- **Undo/redo** comes from zundo and covers tables, guests and venue. Commit to the store on gesture end (drag end, transform end), not on every pointer move.
- **Saving**: `useAutosave` debounces a PATCH to `/internal/events/:slug` and shows status in the header. No toasts for routine saves.
- The venue (room size, stage, bar...) and event details (date, venue name, welcome message, checklist) are stored in `Event.metadata` JSON, so they need no migration.
- Seat ids are `${tableId}-seat-${n}`. Keep that format; the guest app and saved data depend on it.

## Conventions

- Conventional commits (`feat(floor-plan): ...`). Use bullet points in the body when it's long.
- One feature branch per piece of work, merged into `main`.
- Comments only where the why isn't obvious. Short, plain sentences.
- Icons: `lucide-react` at `strokeWidth={1.75}` in new planner code.
- Motion: ease-out curves, under ~300ms, `pressable` class for press feedback, nothing animated on keyboard-driven actions. See `docs/DESIGN.md`.

## Gotchas

- `@app/shared` is aliased to `shared/src` in each app's Vite config and tsconfig.
- Server `tsc --noEmit` reports 7 errors from `shared` UI files; they predate this work and don't affect `tsup` builds.
- Renaming an event changes its slug on the server; `useUpdateEventInfo` follows the new URL.
