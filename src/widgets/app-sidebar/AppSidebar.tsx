import { Plus, Upload06Icon } from '@hugeicons/core-free-icons';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  AddGuestDialog,
  SeatedGuestsSection,
  UnseatedGuestsSection,
} from '@/features/guests';
import { IconButton, ThemeToggle } from '@/shared/components';
import { useState } from 'react';

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
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
              <IconButton
                stretch
                Label="Add Guest"
                Icon={Plus}
                onClick={() => setOpen(true)}
              />
              <IconButton stretch Label="Import" Icon={Upload06Icon} />
            </div>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarContent>
          <UnseatedGuestsSection />
          <SeatedGuestsSection />
        </SidebarContent>
      </Sidebar>
      <AddGuestDialog open={open} onOpenChange={setOpen}/>
    </>
  );
}
