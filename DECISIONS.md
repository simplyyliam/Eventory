# Decisions

Short records of choices that shaped the overhaul. Newest at the bottom.

## 001 · One workspace store per open event

The old app had separate persisted stores for events, tables and guests, each keeping a per-event cache in IndexedDB, plus a hand-written undo stack that cloned everything on each change. They drifted out of sync and the cache could show stale data after editing elsewhere.

**Now:** the server is the source of truth. `store/workspace.ts` holds the open event's tables, guests and venue, hydrated on open and autosaved on change. History uses [zundo](https://github.com/charkour/zundo) over just those three slices.

## 002 · Keep the database schema, put new data in `Event.metadata`

The API is deployed against a live Postgres. New things (room size, stage/bar/dance floor, event date and venue, welcome message, planning checklist) go in the existing `metadata` JSON column, and the table "finish" reuses `textureId`. No migration, nothing breaks for the guest app.

## 003 · Plan units: 200 per metre

The old editor stored pixels with no real-world meaning. At 200 units per metre the old tables (radius 120, 150 x 320) come out at plausible sizes, so existing layouts keep working. Table sizes now follow the banquet rule of thumb of about 60 cm per guest, and the 3D view converts units to metres with the same constant.

## 004 · react-konva for the floor plan

The old editor was absolutely positioned DOM with window-level pointer listeners. Every pointer move wrote to the store, which re-rendered every table, and that caused the choppiness. Pan and zoom were also React state updates on each frame.

Konva gives a scene graph with built-in drag, hit testing and a Transformer for rotation. react-konva is its official React binding. PixiJS was considered, but it is a renderer without editing tools, which we'd have to build ourselves. Drags now run inside Konva and commit to the store once, on drag end.

Pinned to `react-konva@19.2.x` because 19.3 requires React 19.3.

## 005 · Native HTML drag for the contents panel

Dragging a table from the side panel onto the canvas uses the platform drag API plus `stage.setPointersPositions(e)`, which is the approach Konva's docs recommend. dnd-kit is aimed at DOM-to-DOM sortable lists and adds nothing when the drop target is a canvas. Guests are dragged onto seats the same way.

## 006 · Linked tables removed

Snapping two long tables together hid their touching end seats through a special "linked" field. It was fragile (unlinking restored the wrong seats). Now you can hide any seat directly, and alignment guides snap tables edge to edge. The `linkedTableId` column is left null.

## 007 · RSVP status means RSVP

The server used to force `status = confirmed` whenever a guest had a seat, so "attending" and "seated" were the same thing. Status is now the guest's reply (`pending | confirmed | declined`) and seating is tracked separately. Declined guests don't count towards seats needed.

## 008 · Public endpoints don't expose emails

`/public/events/:slug` returned every guest's email and notes to anyone with the link. Public reads now select only name, status, seat and table, and skip declined guests.

## 009 · 3D view: react-three-fiber + drei, read-only

R3F keeps the scene declarative and driven by the same store. drei provides `CameraControls` (smooth animated orbit and pan), `PointerLockControls` (walk and fly), `Html` (the floating table card) and contact shadows. Lighting uses drei `Lightformer`s instead of a downloaded HDRI, so nothing is fetched at runtime.

The 3D view never edits. Clicking a table shows details only; layout changes happen in 2D.

## 010 · TanStack Query for server reads

The event list and event loading need loading, error and refetch states, and optimistic delete. React Query covers those without hand-rolled effects. The open event's query is never refetched in the background, because the workspace store owns it after load.

## 011 · Publishing is a status change

Publishing used to re-upload the whole event through `POST /events`, which regenerated every table id, behind fake progress bars. The workspace already autosaves, so publishing now just flushes the save and flips `status` to `published`.

## 012 · Guest app reads the floor plan

Guests now see where their table is: the guest app draws a small map from the same table positions and venue metadata. It also shows tablemates and the planner's welcome message, which replaces the hard-coded birthday text.

## 013 · Poly Haven models, simplified at build time

Chairs and plants in the 3D view use CC0 models from Poly Haven instead of primitives. The originals are around 20k triangles per chair, which in a 300-seat room is millions of triangles and too slow on integrated GPUs. They are run once through `gltf-transform optimize` (simplify to ~12%, 512px WebP textures) and committed as GLB files under `public/models`. The chair stays a single mesh, so every seat renders in one instanced draw call. The exact command is in `public/models/CREDITS.txt`.

## 014 · 3D navigation without game controls

Walk and fly work like a property tour, not a game. You drag to look, click the floor to glide there, and scroll to move. There is no pointer lock. WASD/arrow keys also move the camera (requested after the first version left them out); they drive the same controls, so there's no captured cursor or crosshair. Everything runs on one `CameraControls` instance with per-mode settings, and the canvas renders on demand at the native pixel ratio.

## 015 · Decor styles instead of per-item decoration

Event holders need the 3D view to show the room as it will feel on the day, and a set of styles gets most of the way with one choice. Each style sets napkins, chargers, centrepieces (flowers, balloons, candles or greenery), fairy lights, chandeliers, curtain colour and the banner and sign text. It's stored as `metadata.decor` (`{ theme, accent }`). Place settings and bulbs are instanced, so a dressed room adds only a handful of draw calls.
