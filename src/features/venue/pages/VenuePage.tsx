import { DragArea, PageContainer } from '@/shared/components';

export function VenuePage() {
  return (
    <PageContainer id="venue" className="flex items-center justify-center">
      <DragArea>
        <div className="w-10 h-10 bg-slate-500"></div>
      </DragArea>
    </PageContainer>
  );
}
