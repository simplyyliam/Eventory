import { RouterProvider } from "react-router-dom";
import { Router } from "./router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useModal } from "@/hooks/useModal";

export default function App() {
  useModal()
  return (
    <ThemeProvider>
      <TooltipProvider>
        <RouterProvider router={Router} />
      </TooltipProvider>
    </ThemeProvider>
  );
}
