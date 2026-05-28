import { DragArea, PageContainer } from '@/shared/components';
import { Table } from '../components/table/Table';

export function VenuePage() {
  return (
    <PageContainer id="venue" className="flex items-center justify-center">
      <DragArea>
        <Table shape="circle" />
        <Table shape="rectangle" />
      </DragArea>
    </PageContainer>
  );
}
