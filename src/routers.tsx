import { createBrowserRouter, type RouteObject } from "react-router";

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
import UsersPage from "@/pages/app/users/UsersPage";
import RolesPage from "@/pages/app/roles/RolesPage";
import MasterDataPage from "@/pages/app/master_data/MasterDataPage";
import SettingsPage from "@/pages/app/settings/SettingPage";
import NotificationsPage from "@/pages/app/notifications/NotificationsPage";
import ProductCategoryPage from "@/pages/app/product/ProductCategoryPage";

// Documentation
import DocPage from "@/pages/doc";

// Errors
import ErrorBoundaryPage from "@/pages/error/ErrorBoundaryPage";
import NotFoundPage from "@/pages/error/NotFoundPage";

export const sidebarLinks: ISidebarLink[] = [
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

  {
    label: { id: "Pengguna", en: "Users" },
    path: "users",
    element: <UsersPage ruleKey="users" />,
    strict: true,
    icon: "Hi/HiOutlineUser",
  },

  {
    label: { id: "Data Master", en: "Master Data" },
    path: "master-data",
    element: <MasterDataPage ruleKey="master-data" />,
    strict: true,
    extraRuleKeys: [
      {
        label: { id: "Merek", en: "Brand" },
        ruleKey: "brand",
      },
    ],
    icon: "Hi/HiOutlineDatabase",
  },

  {
    label: { id: "Produk", en: "Product" },
    path: "products",
    icon: "Hi/HiOutlineCube",
    children: [
      {
        label: { id: "Kategori", en: "Category" },
        path: "categories",
        element: <ProductCategoryPage ruleKey="product-categories" />,
        strict: true,
        icon: "Hi/HiOutlineTag",
      },
    ],
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
        element: <AppLayout sidebarLinks={sidebarLinks} />,
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
            return flatten(sidebarLinks);
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
