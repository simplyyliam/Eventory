import { AddGuestModal } from '@/features/guests';
import { IconButton, PageContainer } from '@/shared/components';

export function VenuePage() {


  return (
    <PageContainer className='flex items-center justify-center'>
      <AddGuestModal />
      <IconButton Label='Add Guest'/>
    </PageContainer>
  );
}
