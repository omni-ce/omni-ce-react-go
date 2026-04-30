import { createBrowserRouter } from "react-router";
import {
  HiOutlineCog,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineDatabase,
} from "react-icons/hi";

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
import RolesPage from "@/pages/app/RolesPage";
import MasterDataPage from "@/pages/app/MasterDataPage";
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
    icon: HiOutlineHome,
  },

  {
    label: { id: "Peran", en: "Roles" },
    path: "roles",
    element: <RolesPage />,
    strict: true,
    icon: HiOutlineShieldCheck,
  },

  {
    label: { id: "Pengguna", en: "Users" },
    path: "users",
    element: <UsersPage />,
    strict: true,
    icon: HiOutlineUser,
  },

  {
    label: { id: "Data Master", en: "Master Data" },
    path: "master-data",
    element: <MasterDataPage />,
    strict: true,
    icon: HiOutlineDatabase,
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
