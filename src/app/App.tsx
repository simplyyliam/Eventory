import { RouterProvider } from "react-router-dom";
import { Router } from "./router";
import { TooltipProvider } from "@/components/ui/tooltip";


export default function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={Router}/>
    </TooltipProvider>
  )
}
