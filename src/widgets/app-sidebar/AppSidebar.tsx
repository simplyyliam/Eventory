import { Plus, Upload06Icon } from '@hugeicons/core-free-icons';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SeatedGuestsSection, UnseatedGuestsSection } from '@/features/guests';
import { IconButton, ThemeToggle } from '@/shared/components';
import { useModalStore } from '@/store/useModalStore';

export function AppSidebar() {
  const { openModal } = useModalStore()
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu className="items-center">
          <SidebarMenuItem className="flex w-full items-center justify-between gap-2">
            <span>Manage Guest</span>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <div className="flex gap-2">
            <IconButton stretch Label="Add Guest" Icon={Plus} onClick={() => openModal("GuestModal")}/>
            <IconButton stretch Label="Import" Icon={Upload06Icon} />
          </div>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <UnseatedGuestsSection />
        <SeatedGuestsSection />
      </SidebarContent>
    </Sidebar>
  );
}