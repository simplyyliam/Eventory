import { Outlet, useLocation } from 'react-router-dom';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'motion/react';
import { PanelLeft } from 'lucide-react';
import { Toaster } from '@app/shared/components/ui/sonner';
import { Sidebar } from './Sidebar';
import { CommandMenu } from './CommandMenu';
import { NewEventDialog } from '@/features/dashboard/NewEventDialog';
import { useTheme, resolvedTheme } from '@/lib/theme';

export const useShell = create<{ mobileOpen: boolean; setMobileOpen: (v: boolean) => void }>((set) => ({
  mobileOpen: false,
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}));

// Canvas screens use the whole panel and handle their own scrolling.
const FULL_BLEED = /\/(floor-plan|view)$/;

export function AppShell() {
  const { pathname } = useLocation();
  const { mobileOpen, setMobileOpen } = useShell();
  const fullBleed = FULL_BLEED.test(pathname);
  const theme = useTheme((s) => s.theme);

  return (
    <div className="flex h-svh overflow-hidden bg-canvas">
      <aside className="hidden w-60 shrink-0 md:flex">
        <Sidebar />
      </aside>

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
              className="fixed inset-y-0 left-0 z-50 w-64 bg-canvas shadow-xl md:hidden"
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

      <main className="flex min-w-0 flex-1 flex-col p-0 md:py-2 md:pr-2">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3 md:hidden">
          <button
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="pressable grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <PanelLeft className="size-4" />
          </button>
          <span className="text-[13px] font-medium">Eventory</span>
        </div>
        <div
          className={`relative min-h-0 flex-1 bg-surface md:rounded-xl md:shadow-[0_0_0_1px_var(--hairline),0_1px_3px_rgb(0_0_0/0.04)] ${fullBleed ? 'overflow-hidden' : 'overflow-y-auto'}`}
        >
          <Outlet />
        </div>
      </main>

      <CommandMenu />
      <NewEventDialog />
      <Toaster position="bottom-right" theme={resolvedTheme(theme)} />
    </div>
  );
}
