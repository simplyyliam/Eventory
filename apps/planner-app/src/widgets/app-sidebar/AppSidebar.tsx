import {
  ArrowLeft01Icon,
  Plus,
  Upload06Icon,
} from '@hugeicons/core-free-icons';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@app/shared/components/ui/sidebar';
import {
  AddGuestDialog,
  SeatedGuestsSection,
  UnseatedGuestsSection,
} from '@/features/guests';
import { IconButton, ThemeToggle } from '@/shared/components';
import { useEventStore } from '@/store/useEventStore';
import { useModalStore } from '@/store/useModalStore';
import { useNavigate } from 'react-router-dom';

export function AppSidebar() {
  const navigate = useNavigate();
  const open = useModalStore((s) => s.addGuestOpen);
  const setOpen = useModalStore((s) => s.setAddGuestOpen);
  const activeEvent = useEventStore((s) => s.activeEvent);

  return (
    <>
      <Sidebar variant="floating">
        <SidebarHeader>
          <SidebarMenu className="items-center">
            <SidebarMenuItem className="flex w-full items-center justify-between gap-2">
              {activeEvent ? (
                <div className="flex items-center gap-2.5">
                  <IconButton Icon={ArrowLeft01Icon} onClick={() => navigate('/')}/>
                  <div className="flex items-center">
                    <span className="font-medium text-sm">
                      {activeEvent.name}
                    </span>
                    <span className="ml-2 text-muted-foreground text-sm">
                      {activeEvent.status}
                    </span>
                  </div>
                </div>
              ) : null}
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
      <AddGuestDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
