import { type ISidebarLink } from "@/layouts/AppLayout";

// Users
import UserPage from "@/pages/system/user/UserPage";

// Master Data
import MasterDataPage from "@/pages/app/master_data/MasterDataPage";

// Company Structure
import CompanyEntityPage from "@/pages/app/company/CompanyEntityPage";
import CompanyBranchPage from "@/pages/app/company/CompanyBranchPage";

// Products
import ProductCategoryPage from "@/pages/app/product/ProductCategoryPage";
import ProductTypePage from "@/pages/app/product/ProductTypePage";
import ProductBrandPage from "@/pages/app/product/ProductBrandPage";
import ProductVariantPage from "@/pages/app/product/ProductVariantPage";
import ProductMemoryPage from "@/pages/app/product/ProductMemoryPage";
import ProductColorPage from "@/pages/app/product/ProductColorPage";
import ProductItemPage from "@/pages/app/product/ProductItemPage";

// Loyalty
import CustomerPage from "@/pages/app/loyalty/CustomerPage";

const sidebarLinks: ISidebarLink[] = [
  {
    label: { id: "Pengguna", en: "User" },
    path: "user",
    element: <UserPage ruleKey="user" />,
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
    label: { id: "Perusahaan", en: "Company" },
    path: "company",
    icon: "Pi/PiTreeStructureBold",
    children: [
      {
        label: { id: "Entitas Perusahaan", en: "Company Entity" },
        path: "entity",
        element: <CompanyEntityPage ruleKey="company/entity" />,
        strict: true,
        icon: "Fa6/FaBuildingCircleCheck",
      },
      {
        label: { id: "Cabang Perusahaan", en: "Company Branch" },
        path: "branch",
        element: <CompanyBranchPage ruleKey="company/branch" />,
        strict: true,
        icon: "Tb/TbGitBranch",
      },
    ],
  },

  {
    label: { id: "Produk", en: "Product" },
    path: "product",
    icon: "Hi/HiOutlineCube",
    children: [
      {
        label: { id: "Kategori", en: "Category" },
        path: "category",
        element: <ProductCategoryPage ruleKey="product/category" />,
        strict: true,
        icon: "Hi/HiOutlineTag",
      },
      {
        label: { id: "Tipe", en: "Type" },
        path: "type",
        element: <ProductTypePage ruleKey="product/type" />,
        strict: true,
        icon: "Tb/TbCategoryPlus",
      },
      {
        label: { id: "Merek", en: "Brand" },
        path: "brand",
        element: <ProductBrandPage ruleKey="product/brand" />,
        strict: true,
        icon: "Hi/HiOutlineStar",
      },
      {
        label: { id: "Varian", en: "Variant" },
        path: "variant",
        element: <ProductVariantPage ruleKey="product/variant" />,
        strict: true,
        icon: "Hi/HiOutlineCog",
      },
      {
        label: { id: "Memori", en: "Memory" },
        path: "memory",
        element: <ProductMemoryPage ruleKey="product/memory" />,
        strict: true,
        icon: "Gr/GrMemory",
      },
      {
        label: { id: "Warna", en: "Color" },
        path: "color",
        element: <ProductColorPage ruleKey="product/color" />,
        strict: true,
        icon: "Hi/HiColorSwatch",
      },
      {
        label: { id: "Item (Grup)", en: "Item (Group)" },
        path: "item",
        element: <ProductItemPage ruleKey="product/item" />,
        strict: true,
        icon: "Hi/HiTemplate",
      },
    ],
  },

  {
    label: { id: "Loyalty", en: "Loyalty" },
    path: "loyalty",
    icon: "Md/MdLoyalty",
    children: [
      {
        label: { id: "Pelanggan", en: "Customer" },
        path: "customer",
        element: <CustomerPage ruleKey="loyalty/customer" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
    ],
  },
];

export default sidebarLinks;
