import { createPortal } from 'react-dom';
import type { Guest, PlanTable } from '@/domain/types';

// Only visible when printing (see the print rules in index.css).
export function PrintSheet({ name, guests, tables, seatNumber }: { name: string; guests: Guest[]; tables: PlanTable[]; seatNumber: (s: string) => number }) {
  const byId = new Map(tables.map((t) => [t.id, t]));
  const seated = guests.filter((g) => g.tableId && g.seat).sort((a, b) => a.name.localeCompare(b.name));
  const ordered = [...tables].filter((t) => seated.some((g) => g.tableId === t.id)).sort((a, b) => a.tableNumber - b.tableNumber);

  return createPortal(
    <div id="print-sheet">
      <h1>{name}</h1>
      <h2>Find your seat</h2>
      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Table</th>
            <th>Seat</th>
          </tr>
        </thead>
        <tbody>
          {seated.map((g) => (
            <tr key={g.id}>
              <td>{g.name}</td>
              <td>{byId.get(g.tableId!)?.name}</td>
              <td>{seatNumber(g.seat!)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ordered.map((t) => (
        <section key={t.id} className="print-table">
          <h2>{t.name}</h2>
          <ol>
            {seated
              .filter((g) => g.tableId === t.id)
              .sort((a, b) => seatNumber(a.seat!) - seatNumber(b.seat!))
              .map((g) => (
                <li key={g.id}>
                  <span>{seatNumber(g.seat!)}.</span> {g.name}
                  {g.dietary.length > 0 && <em> · {g.dietary.join(', ')}</em>}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </div>,
    document.body,
  );
}
