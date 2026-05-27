import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { VenuePage } from "@/features/venue";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <VenuePage />,
      },
    ],
  },
]);
