import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import type { ComponentType } from "react";

type PageModule = {
  default: ComponentType;
};

const pages = import.meta.glob("../pages/**/page.tsx", {
  eager: true
})



const routes = Object.entries(pages).map(([path, module]) => {
  const Component = (module as PageModule).default

  const routePath = path
    .replace("../pages", "")
    .replace("/page.tsx", "")
    .toLowerCase()

    return {
      path: routePath === "/venue" ? "/" : routePath,
      element: <Component/>
    }
})

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: routes
  },
]);
