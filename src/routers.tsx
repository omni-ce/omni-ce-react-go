import { createBrowserRouter, type RouteObject } from "react-router";

import sidebarLinks from "@/sidebar";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout, { type ISidebarLink } from "@/layouts/AppLayout";

// Public: Pages
import LandingPage from "@/pages/public/LandingPage";

// Auth: Pages
import LoginPage from "@/pages/auth/LoginPage";
import SelectRolePage from "@/pages/auth/SelectRolePage";

// App: Pages
import DashboardPage from "@/pages/app/DashboardPage";
import RolesPage from "@/pages/app/roles/RolesPage";
import SettingsPage from "@/pages/app/settings/SettingPage";
import NotificationsPage from "@/pages/app/notifications/NotificationsPage";

// Documentation
import DocPage from "@/pages/doc";

// Errors
import ErrorBoundaryPage from "@/pages/error/ErrorBoundaryPage";
import NotFoundPage from "@/pages/error/NotFoundPage";

export const sidebarSystemLinks: ISidebarLink[] = [
  {
    label: { id: "Dashboard", en: "Dashboard" },
    path: "dashboard",
    element: <DashboardPage />,
    icon: "Hi/HiOutlineHome",
  },
  {
    label: { id: "Peran", en: "Roles" },
    path: "roles",
    element: <RolesPage ruleKey="roles" />,
    strict: true,
    icon: "Hi/HiOutlineShieldCheck",
  },
];

export const routers = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        path: "/",
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <LandingPage />,
          },
        ],
      },
      {
        path: "login",
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <LoginPage />,
          },
        ],
      },
      {
        path: "select-role",
        element: <SelectRolePage />,
      },
      {
        path: "app",
        element: (
          <AppLayout sidebarLinks={[...sidebarSystemLinks, ...sidebarLinks]} />
        ),
        children: [
          ...(() => {
            const flatten = (
              links: ISidebarLink[],
              base = "",
            ): RouteObject[] => {
              return links.flatMap((link) => {
                const fullPath = base ? `${base}/${link.path}` : link.path;
                const routes: RouteObject[] = [];
                if (link.element) {
                  routes.push({
                    path: fullPath as string,
                    element: link.element,
                  });
                }
                if (link.children) {
                  routes.push(...flatten(link.children, fullPath));
                }
                return routes;
              });
            };
            return flatten([...sidebarSystemLinks, ...sidebarLinks]);
          })(),
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
        ],
      },
    ],
    errorElement: <ErrorBoundaryPage />,
  },
  {
    path: "doc",
    element: <DocPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
