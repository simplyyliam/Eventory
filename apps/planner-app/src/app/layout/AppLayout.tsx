import { AppSidebar } from '@/widgets/app-sidebar';
import { SidebarInset, SidebarProvider } from '@app/shared/components/ui/sidebar';
import { Outlet } from 'react-router-dom';
import { AppMenubar } from '@/widgets/app-menubar';

export default function AppLayout() {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden ">
        <AppMenubar/>
        <div className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
