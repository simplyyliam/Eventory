# Research notes

Sources behind the feature and design choices. Each feature lists where the need came from.

## Event-planning features

| Need | Source | Feature |
| --- | --- | --- |
| RSVP tracking that updates seating needs | Capterra listing for SeatPlanning (RSVP links/QR, dietary capture) | RSVP status per guest; declined guests excluded from seats needed |
| Dietary requirements visible while seating, grouped for caterers | Gatsby seating-chart docs ("group by dietary restriction for efficient plating") | Dietary tags, overview summary with copy-for-caterer, dietary dots on seats and in the 3D card |
| Automatic allocation | SeatPlanning (automatic seat distribution) | Auto-seat in the floor plan |
| Export/print for caterers, venue staff, check-in | RSVPify (export or print for caterers, staff, check-in teams) | CSV export ordered by table, printable A–Z list plus per-table pages |
| Dashboards should flag what needs attention and link to the fix | Administrate event screen docs; Softr event dashboard guidance | Overview "Needs attention" list, home summary sentence |
| Keep dashboards simple and grouped | godreamcast dashboard glossary | Four stats, then attention / checklist / tables / dietary |

## Libraries

- **react-konva** for the 2D editor: Konva FAQ and the pkgpulse 2026 comparison (scene graph, drag, Transformer). PixiJS was rejected because it's a renderer with no editing tools.
- **drei CameraControls / AdaptiveDpr / Html**: drei docs. PointerLock was dropped after user feedback (see DECISIONS 014).
- **Poly Haven** models (CC0), checked via `api.polyhaven.com`, then simplified with gltf-transform (DECISIONS 013).

## Interaction design

- Emil Kowalski's design-engineering notes: ease-out under 300ms, scale 0.97 on press, no animation on keyboard actions, origin-aware popovers.
- Rauno Freiberg, "Invisible details of interaction design": frequency vs novelty, spatial consistency, confirmation cues.

Applied rules are in `docs/DESIGN.md`.
