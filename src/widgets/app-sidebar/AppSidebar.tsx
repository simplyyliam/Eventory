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
import { IconButton } from '@/shared/components';

export function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu className="items-center">
          <SidebarMenuItem>Manage Guest</SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <div className="flex gap-2">
            <IconButton label="Add Guest" Icon={Plus} />
            <IconButton label="Import" Icon={Upload06Icon} />
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

// <DropdownMenu>
//   <DropdownMenuTrigger>
//     <SidebarMenuButton>
//       Select Workspace
//       <HugeiconsIcon icon={ChevronDown}/>
//     </SidebarMenuButton>
//   </DropdownMenuTrigger>
//   <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
//     <DropdownMenuItem>
//       <span>Acme Inc</span>
//     </DropdownMenuItem>
//   </DropdownMenuContent>
// </DropdownMenu>
