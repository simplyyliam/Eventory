import { DragArea, PageContainer } from '@/shared/components';
import { useTableStore } from '@/store/useTableStore';
import { Table } from '../../features/venue/components/table/Table';


export default function VenuePage() {
  const tables = useTableStore((s) => s.tables)
  return (
    <PageContainer id="venue" className="flex items-center justify-center">
      <DragArea>
        {tables.map((table) => (
          <Table shape={table.shape} seatCount={table.seatCount}/>
        ))}
      </DragArea>
    </PageContainer>
  );
}
