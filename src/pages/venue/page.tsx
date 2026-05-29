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
