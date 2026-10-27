# Design notes

## What the references have in common

The images in `docs/design/` are the brief. They aren't copied directly, but every screen should look like it belongs next to them.

**Desktop product references** (History, Dovetail, Audit log, CRM table, People, Knowledge hub, Filters, Task list, Commit history)

- **Off-white canvas, white surfaces.** The window background is a warm off-white. Content sits on white panels separated by 1px hairlines, not shadows. Depth comes from one level of layering, never more.
- **Quiet sidebar.** Same colour as the canvas, no borders around items. The active item gets a soft filled pill. Section labels are small and grey ("Tools", "Recent chats", "Collections"), and counts sit right-aligned in muted text.
- **Small, even type.** 13–14px body, regular weight. Titles are only slightly larger, with a muted count next to them ("People 2,942"). Hierarchy comes from grey vs. black, not from size.
- **Tinted status pills.** Pastel background with saturated text of the same hue, sometimes an icon. Neutral tags are outlined white chips.
- **Tables are lists.** Rows have hairline separators, no zebra stripes, and checkboxes on the left. Row actions (`•••`) appear on hover.
- **Rounded but not bubbly.** Around 8px on controls, 12–16px on cards and windows.
- **Sentences instead of widgets.** The greeting screen ("Today includes 3 tickets, 2 client follow ups…") turns a dashboard into one readable sentence with bold inline counts.
- **Small details:** progress rings next to tasks, relative times on the right in grey, a coloured dot for unread, and hover cards that show more on demand.

**3D references** (isometric rooms, Casa, smart home)

- Matte "clay" walls in warm white, cut away so you look in from above. Light wood floors.
- Soft, warm key light with long, gentle contact shadows. There are no hard edges or pure black anywhere.
- Information floats over the scene in a frosted white card with label/value rows (Casa). That's the model for the table card in our 3D view.

**Mobile references** (guest app)

- Cream or near-white backgrounds, one bold colour block, large serif display type, and tiny uppercase monospace labels ("NOW PLAYING", "GENERATING IN PROCESS...").
- Content in a bottom sheet with a grab handle. Primary action is a dark pill button.

## Tokens

Defined in `apps/planner-app/src/index.css`:

| Token | Use |
| --- | --- |
| `canvas` | app background, sidebar |
| `surface` | panels, cards, popovers |
| `subtle` | inset fills, empty bars |
| `hairline` | every border and divider |
| `faint` | tertiary text, inactive icons |
| `ok / warn / bad / info` (+ `-soft`) | status pills and dots |
| `brand` | selection, focus rings, links. Used sparingly. |

Type is Inter at 13px. Use `tabular` for any number that changes.

## Motion and feedback

These rules come from Emil Kowalski's design engineering notes and Rauno Freiberg's "Invisible details of interaction design".

- **Every press answers.** `pressable` (or the shared Button) scales to 0.97 on press.
- **Numbers roll, they don't flicker.** Counts that change while you watch (seated, RSVPs, seats) use `RollingNumber`.
- **Spatial consistency.** Menus and popovers grow from their trigger (`origin-(--transform-origin)`). The active sidebar pill slides between items (`layoutId`), and the theme switch does the same.
- **Confirmation cues.** Copy buttons morph to a check, and the save indicator pulses while saving then settles to a check.
- **Physical canvas.** Tables lift (shadow and scale) while dragged and settle on drop. A seat pops when someone is assigned. Alignment guides fade in only when you're close.
- **Restraint.** Nothing animates on keyboard actions or the ⌘K menu. UI transitions stay under 300ms with ease-out. `MotionConfig reducedMotion="user"` respects the OS setting.
- **Easing:** `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, and drawers use `cubic-bezier(0.32, 0.72, 0, 1)`.
