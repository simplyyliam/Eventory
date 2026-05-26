import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/layout";
import { Venue } from "./components";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Venue/>,
      },
    ],
  },
]);