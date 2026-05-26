import { Plus, Upload06Icon } from '@hugeicons/core-free-icons';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '../ui/sidebar';
import { ButtonIcon } from './ButtonIcon';
import { SeatedGuests, UnseatedGuests } from '../views/Groups';

export default function AppDefault() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu className="items-center">
          <SidebarMenuItem>Manage Guest</SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <div className="flex gap-2">
            <ButtonIcon label="Add Guest" Icon={Plus} />
            <ButtonIcon label="Import" Icon={Upload06Icon} />
          </div>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <UnseatedGuests />
        <SeatedGuests/>
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
