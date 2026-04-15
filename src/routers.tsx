import { createBrowserRouter } from "react-router";
import { HiOutlineCog, HiOutlineHome, HiOutlineUser } from "react-icons/hi";

// Layouts
import MainLayout from "@/layouts/MainLayout";
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

  {
    show_hr: true,
    label: { id: "Pengaturan", en: "Settings" },
    path: "settings",
    element: <SettingsPage />,
    roles: [],
    icon: HiOutlineCog,
  },
];

export const routers = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        path: "/",
        element: <MainLayout />,
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
        children: sidebarLinks.map((link) => ({
          path: link.path as string,
          element: link.element,
        })),
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
