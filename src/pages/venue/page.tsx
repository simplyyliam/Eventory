import { DragArea, PageContainer } from '@/shared/components';
import { useTableStore } from '@/store/useTableStore';
import { Table } from '../../features/venue/components/table/Table';

export default function VenuePage() {
  const tables = useTableStore((s) => s.tables);

  return (
    <PageContainer
      id="venue"
      className="relative flex items-center justify-center"
    >
      <aside className="absolute left-2.5 top-16 z-10 rounded-xl border bg-background/80 p-3 text-sm backdrop-blur-md">
        <h2 className="mb-2 font-medium">Tables</h2>
        {tables.length > 0 ? (
          <ul className="space-y-1">
            {tables.map((table) => (
              <li key={table.id} className="flex gap-2">
                <span>{table.name}</span>
                <span className="text-muted-foreground">
                  {table.id} - {table.seatCount} seats
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No tables yet</p>
        )}
      </aside>

      <DragArea>
        {tables.map((table) => (
          <Table
            key={table.id}
            id={table.id}
            name={table.name}
            shape={table.shape}
            seatCount={table.seatCount}
            tableId={table.id}
          />
        ))}
      </DragArea>
    </PageContainer>
  );
}
