import {
  ArrowLeft01Icon,
  Plus,
  Upload06Icon,
} from '@hugeicons/core-free-icons';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@app/shared/components/ui/sidebar';
import {
  AddGuestDialog,
  ImportGuestDialog,
  SeatedGuestsSection,
  UnseatedGuestsSection,
} from '@/features/guests';
import { IconButton, ThemeToggle } from '@/shared/components';
import { useEventStore } from '@/store/useEventStore';
import { useModalStore } from '@/store/useModalStore';
import { useNavigate } from 'react-router-dom';
import { useSelectionStore } from '@/store/useSelectionStore';
import { useGuestStore } from '@/store/useGuestStore';
import { withHistory } from '@/lib/withHistory';
import { Button } from '@app/shared';

export function AppSidebar() {
  const navigate = useNavigate();
  const openAddGuest = useModalStore((s) => s.addGuestOpen);
  const setOpenAddGuest = useModalStore((s) => s.setAddGuestOpen);
  const importGuests = useModalStore((s) => s.importGuestsOpen);
  const setImportGuestOpen = useModalStore((s) => s.setImportGuestOpen);
  const activeEvent = useEventStore((s) => s.activeEvent);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const clear = useSelectionStore((s) => s.clear);
  const removeGuest = useGuestStore((s) => s.removeGuest);
  const isSelecting = selectedIds.size > 0;

  const handleBulkRemove = () => {
    withHistory(() => {
      selectedIds.forEach((id) => removeGuest(id));
    });
    clear();
  };

  return (
    <>
      <Sidebar variant="floating">
        <SidebarHeader>
          <SidebarMenu className="items-center">
            <SidebarMenuItem className="flex w-full items-center justify-between gap-2">
              {activeEvent ? (
                <div className="flex items-center gap-2.5">
                  <IconButton Icon={ArrowLeft01Icon} onClick={() => navigate('/')} />
                  <div className="flex items-center">
                    <span className="font-medium text-sm">{activeEvent.name}</span>
                    <span className="ml-2 text-muted-foreground text-sm">{activeEvent.status}</span>
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
                onClick={() => setOpenAddGuest(true)}
              />
              <IconButton stretch Label="Import" Icon={Upload06Icon} onClick={() => setImportGuestOpen(true)} />
            </div>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarContent>
          <UnseatedGuestsSection />
          <SeatedGuestsSection />
        </SidebarContent>
        {isSelecting && (
          <SidebarFooter className="p-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex-1 p-3 h-fit" onClick={clear}>
                Cancel
              </Button>
              <Button className="flex-1 p-3 h-fit" onClick={handleBulkRemove}>
                Delete {selectedIds.size} {selectedIds.size === 1 ? 'guest' : 'guests'}
              </Button>
            </div>
          </SidebarFooter>
        )}
      </Sidebar>
      <AddGuestDialog open={openAddGuest} onOpenChange={setOpenAddGuest} />
      <ImportGuestDialog open={importGuests} onOpenChange={setImportGuestOpen} />
    </>
  );
}