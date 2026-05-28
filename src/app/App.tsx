import { RouterProvider } from "react-router-dom";
import { Router } from "./router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useModal } from "@/hooks/useModal";
import { AddGuestModal } from "@/features/guests";

export default function App() {
  useModal()
  return (
    <ThemeProvider>
      <TooltipProvider>
        <RouterProvider router={Router} />
        <AddGuestModal/>
      </TooltipProvider>
    </ThemeProvider>
  );
}
