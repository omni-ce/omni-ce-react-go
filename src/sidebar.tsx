import { type ISidebarLink } from "@/layouts/AppLayout";

// Users
import UsersPage from "@/pages/app/users/UsersPage";

// Master Data
import MasterDataPage from "@/pages/app/master_data/MasterDataPage";

// Products
import ProductCategoryPage from "@/pages/app/product/ProductCategoryPage";
import ProductBrandPage from "@/pages/app/product/ProductBrandPage";
import ProductVariantPage from "@/pages/app/product/ProductVariantPage";
import ProductMemoryPage from "@/pages/app/product/ProductMemoryPage";
import ProductColorPage from "@/pages/app/product/ProductColorPage";
import ProductItemPage from "@/pages/app/product/ProductItemPage";

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
        label: { id: "Satuan", en: "Unit" },
        ruleKey: "unit",
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
        label: { id: "Merek", en: "Brand" },
        path: "brands",
        element: <ProductBrandPage ruleKey="products/brands" />,
        strict: true,
        icon: "Hi/HiOutlineStar",
      },
      {
        label: { id: "Varian", en: "Variant" },
        path: "variants",
        element: <ProductVariantPage ruleKey="products/variants" />,
        strict: true,
        icon: "Hi/HiOutlineCog",
      },
      {
        label: { id: "Memori", en: "Memory" },
        path: "memories",
        element: <ProductMemoryPage ruleKey="products/memories" />,
        strict: true,
        icon: "Gr/GrMemory",
      },
      {
        label: { id: "Warna", en: "Color" },
        path: "colors",
        element: <ProductColorPage ruleKey="products/colors" />,
        strict: true,
        icon: "Hi/HiColorSwatch",
      },
      {
        label: { id: "Item (Grup)", en: "Item (Group)" },
        path: "items",
        element: <ProductItemPage ruleKey="products/items" />,
        strict: true,
        icon: "Hi/HiTemplate",
      },
    ],
  },
];

export default sidebarLinks;
