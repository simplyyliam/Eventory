import { AddGuestModal } from '@/features/guests';
import { PageContainer } from '@/shared/components';

export function VenuePage() {
  return (
    <PageContainer className='flex items-center justify-center'>
      <AddGuestModal />
    </PageContainer>
  );
}
