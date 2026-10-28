import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from '@app/shared/components/ui/sonner';
import { useTheme, resolvedTheme } from '@/lib/theme';
import { NewEventDialog } from '@/features/dashboard/NewEventDialog';
import { Sidebar } from './Sidebar';
import { CommandMenu } from './CommandMenu';
import { Topbar } from './Topbar';
import { useShell } from './shellStore';

export function AppShell() {
  const { mobileOpen, setMobileOpen, collapsed } = useShell();
  const theme = useTheme((s) => s.theme);

  return (
    <div className="flex h-svh overflow-hidden bg-surface">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 0 : 248 }}
        transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
        className="hidden shrink-0 overflow-hidden border-r border-hairline bg-sidebar md:block"
        style={{ borderRightWidth: collapsed ? 0 : 1 }}
      >
        <div className="h-full w-62">
          <Sidebar />
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-hairline bg-sidebar md:hidden"
              initial={{ transform: 'translateX(-100%)' }}
              animate={{ transform: 'translateX(0%)' }}
              exit={{ transform: 'translateX(-100%)' }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      <CommandMenu />
      <NewEventDialog />
      <Toaster position="bottom-right" theme={resolvedTheme(theme)} />
    </div>
  );
}
