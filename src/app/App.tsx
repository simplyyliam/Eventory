import { RouterProvider } from "react-router-dom";
import { Router } from "./router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <RouterProvider router={Router} />
      </TooltipProvider>
    </ThemeProvider>
  );
}
