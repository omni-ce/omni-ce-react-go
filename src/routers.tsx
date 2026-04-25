import { createBrowserRouter } from "react-router";
import { HiOutlineCog, HiOutlineHome, HiOutlineUser } from "react-icons/hi";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout, { type ISidebarLink } from "@/layouts/AppLayout";

// Public: Pages
import LandingPage from "@/pages/public/LandingPage";

// Auth: Pages
import LoginPage from "@/pages/auth/LoginPage";

// App: Pages
import DashboardPage from "@/pages/app/DashboardPage";
import UsersPage from "@/pages/app/UsersPage";
import SettingsPage from "@/pages/app/SettingPage";
import NotificationsPage from "@/pages/app/NotificationsPage";

// Documentation
import DocPage from "@/pages/DocPage";

// Errors
import ErrorBoundaryPage from "@/pages/error/ErrorBoundaryPage";
import NotFoundPage from "@/pages/error/NotFoundPage";

const sidebarLinks: ISidebarLink[] = [
  {
    label: { id: "Dashboard", en: "Dashboard" },
    path: "dashboard",
    element: <DashboardPage />,
    roles: [],
    icon: HiOutlineHome,
  },

  {
    label: { id: "Pengguna", en: "Users" },
    path: "users",
    element: <UsersPage />,
    roles: ["admin"],
    icon: HiOutlineUser,
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
        path: "app",
        element: <AppLayout sidebarLinks={sidebarLinks} />,
        children: [
          ...sidebarLinks.map((link) => ({
            path: link.path as string,
            element: link.element,
          })),
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
