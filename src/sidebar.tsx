import { type ISidebarLink } from "@/layouts/AppLayout";

// Users
import UsersPage from "@/pages/app/users/UsersPage";

// Master Data
import MasterDataPage from "@/pages/app/master_data/MasterDataPage";

// Products
import ProductCategoryPage from "@/pages/app/product/ProductCategoryPage";
import ProductColorPage from "@/pages/app/product/ProductColorPage";

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
      {
        label: { id: "Warna", en: "Color" },
        path: "colors",
        element: <ProductColorPage ruleKey="products/colors" />,
        strict: true,
        icon: "Hi/HiColorSwatch",
      },
    ],
  },
];

export default sidebarLinks;
