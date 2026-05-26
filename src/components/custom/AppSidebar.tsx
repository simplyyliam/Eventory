import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '../ui/sidebar';

export default function AppDefault() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>Event planner</SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
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
