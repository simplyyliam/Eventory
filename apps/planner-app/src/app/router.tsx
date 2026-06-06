import { createBrowserRouter, type RouteObject } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import type { ComponentType } from "react";

type PageModule = {
  default: ComponentType;
};

const pages = import.meta.glob("../pages/**/page.tsx", {
  eager: true,
});

const appRoutes: RouteObject[] = [];
const standaloneRoutes: RouteObject[] = [];

let entryRoute: RouteObject | null = null;

for (const [path, module] of Object.entries(pages)) {
  const page = module as PageModule;
  const Component = page.default;

  // ----------------------------
  // 1. Convert file path → route
  // ----------------------------
  let routePath = path
    .replace("../pages", "")
    .replace("/page.tsx", "");

  const isStandalone = routePath.includes("/standalone/");

  // remove grouping prefixes
  routePath = routePath
    .replace("/standalone", "")
    .replace("/app", "");

  const normalizePath = routePath.length === 0 ? "/" : routePath;

  const route: RouteObject = {
    path: normalizePath,
    element: <Component />,
  };

  // ----------------------------
  // 2. ENTRY ROUTE LOGIC
  // ----------------------------
  const isEntryPage =
    isStandalone && normalizePath === "/dashboard";

  if (isEntryPage) {
    entryRoute = {
      path: "/",
      element: <Component />,
    };
    continue;
  }

  // ----------------------------
  // 3. ROUTE CLASSIFICATION
  // ----------------------------
  if (isStandalone) {
    standaloneRoutes.push(route);
  } else {
    appRoutes.push(route);

    if (normalizePath === "/venue") {
      appRoutes.push({
        path: "/venue/:eventSlug",
        element: <Component />,
      });
    }
  }
}

export const Router = createBrowserRouter([
  // --------------------------------
  // ENTRY ROUTE (landing / default)
  // --------------------------------
  entryRoute ?? {
    path: "/",
    element: <div>Missing entry page</div>,
  },

  // --------------------------------
  // APP SHELL ROUTES
  // --------------------------------
  {
    path: "/",
    element: <AppLayout />,
    children: appRoutes,
  },

  // --------------------------------
  // STANDALONE ROUTES
  // --------------------------------
  ...standaloneRoutes,
]);
