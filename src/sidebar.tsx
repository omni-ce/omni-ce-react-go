import { type ISidebarLink } from "@/layouts/AppLayout";

import UsersPage from "@/pages/app/users/UsersPage";
import MasterDataPage from "@/pages/app/master_data/MasterDataPage";
import ProductCategoryPage from "@/pages/app/product/ProductCategoryPage";

const sidebarLinks: ISidebarLink[] = [
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
        element: <ProductCategoryPage ruleKey="products/categories" />,
        strict: true,
        icon: "Hi/HiOutlineTag",
      },
    ],
  },
];

export default sidebarLinks;
