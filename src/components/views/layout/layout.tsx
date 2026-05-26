
import { AppSidebar } from '@/components/custom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
