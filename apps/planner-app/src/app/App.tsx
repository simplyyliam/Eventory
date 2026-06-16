import { RouterProvider } from "react-router-dom";
import { Router } from "./router";
import { TooltipProvider } from "@app/shared/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useModal } from "@/hooks/useModal";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

export default function App() {
  useKeyboardShortcuts()
  useModal()
  return (
    <ThemeProvider>
      <TooltipProvider>
        <RouterProvider router={Router} />
      </TooltipProvider>
    </ThemeProvider>
  );
}
