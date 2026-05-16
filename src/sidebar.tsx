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
import ProductConditionPage from "@/pages/app/product/ProductConditionPage";
import ProductItemPage from "@/pages/app/product/ProductItemPage";

// Supplier
import SupplierEntityPage from "@/pages/app/supplier/SupplierEntityPage";
import SupplierProductPage from "@/pages/app/supplier/SupplierProductPage";

// Warehouse
import WarehouseLocationPage from "@/pages/app/warehouse/WarehouseLocationPage";
import WarehouseProductPage from "@/pages/app/warehouse/WarehouseProductPage";
import WarehouseHistoryPage from "@/pages/app/warehouse/WarehouseHistoryPage";

// Pos
import PosPage from "@/pages/app/pos/PosPage";

// Marketing
import MarketingCustomerPage from "@/pages/app/marketing/MarketingCustomerPage";

// Accounting
import ChartOfAccountPage from "@/pages/app/accounting/ChartOfAccountPage";
import JournalPage from "@/pages/app/accounting/JournalPage";
import BalanceSheetPage from "@/pages/app/accounting/BalanceSheetPage";
import ProfitAndLosePage from "@/pages/app/accounting/ProfitAndLosePage";
import GeneralLedgerPage from "@/pages/app/accounting/GeneralLedgerPage";

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
    label: { id: "Sumber Daya Manusia", en: "Human Resource" },
    path: "human-resource",
    icon: "Fa6/FaUserTie",
    children: [
      {
        label: { id: "4DX", en: "4DX" },
        path: "4dx",
        icon: "Hi/HiUserGroup",
        children: [
          {
            label: { id: "WIG", en: "WIG" },
            path: "wig",
            element: <MarketingCustomerPage ruleKey="human-resource/4dx/wig" />,
            strict: true,
            icon: "Hi/HiUserGroup",
          },
          {
            label: { id: "Ukuran", en: "Measures" },
            path: "measures",
            element: (
              <MarketingCustomerPage ruleKey="human-resource/4dx/measures" />
            ),
            strict: true,
            icon: "Hi/HiUserGroup",
          },
          {
            label: { id: "Papan Skor", en: "Scoreboard" },
            path: "scoreboard",
            element: (
              <MarketingCustomerPage ruleKey="human-resource/4dx/scoreboard" />
            ),
            strict: true,
            icon: "Hi/HiUserGroup",
          },
          {
            label: { id: "Komitmen", en: "Commitments" },
            path: "commitments",
            element: (
              <MarketingCustomerPage ruleKey="human-resource/4dx/commitments" />
            ),
            strict: true,
            icon: "Hi/HiUserGroup",
          },
        ],
      },
      {
        label: { id: "KPI", en: "KPI" },
        path: "kpi",
        element: <MarketingCustomerPage ruleKey="human-resource/kpi" />,
        strict: true,
        icon: "Hi/HiUserGroup",
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
        label: { id: "Kondisi", en: "Condition" },
        path: "condition",
        element: <ProductConditionPage ruleKey="product/condition" />,
        strict: true,
        icon: "Gi/GiBrokenHeartZone",
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
    label: { id: "Supplier", en: "Supplier" },
    path: "supplier",
    icon: "Fa6/FaTruckArrowRight",
    children: [
      {
        label: { id: "Entitas", en: "Entity" },
        path: "entity",
        element: <SupplierEntityPage ruleKey="supplier/entity" />,
        strict: true,
        icon: "Tb/TbBuildingStore",
      },
      {
        label: { id: "Produk", en: "Product" },
        path: "product",
        element: <SupplierProductPage ruleKey="supplier/product" />,
        strict: true,
        icon: "Hi/HiCube",
      },
    ],
  },

  {
    label: { id: "Gudang", en: "Warehouse" },
    path: "warehouse",
    icon: "Fa6/FaWarehouse",
    children: [
      {
        label: { id: "Lokasi", en: "Location" },
        path: "location",
        element: <WarehouseLocationPage ruleKey="warehouse/location" />,
        strict: true,
        icon: "Hi/HiLocationMarker",
      },
      {
        label: { id: "Produk", en: "Product" },
        path: "product",
        element: <WarehouseProductPage ruleKey="warehouse/product" />,
        strict: true,
        icon: "Hi/HiCube",
      },
      {
        label: { id: "Riwayat", en: "History" },
        path: "history",
        element: <WarehouseHistoryPage ruleKey="warehouse/history" />,
        strict: true,
        icon: "Md/MdOutlineHistory",
      },
    ],
  },

  {
    label: { id: "Toko", en: "Store" },
    path: "store",
    icon: "Fa6/FaStore",
    children: [
      {
        label: { id: "Entitas", en: "Entity" },
        path: "entity",
        element: <WarehouseLocationPage ruleKey="store/entity" />,
        strict: true,
        icon: "Hi2/HiOutlineBuildingStorefront",
      },
      {
        label: { id: "Produk", en: "Product" },
        path: "product",
        element: <WarehouseProductPage ruleKey="store/product" />,
        strict: true,
        icon: "Hi/HiCube",
      },
    ],
  },

  {
    label: { id: "POS", en: "POS" },
    path: "pos",
    element: <PosPage ruleKey="pos" />,
    strict: true,
    icon: "Md/MdPointOfSale",
  },

  {
    label: { id: "Marketing", en: "Marketing" },
    path: "marketing",
    icon: "Md/MdOutlineCampaign",
    children: [
      {
        label: { id: "Pelanggan", en: "Customer" },
        path: "customer",
        element: <MarketingCustomerPage ruleKey="marketing/customer" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
    ],
  },

  {
    label: { id: "Loyalty", en: "Loyalty" },
    path: "loyalty",
    icon: "Md/MdOutlineCardGiftcard",
    children: [
      {
        label: { id: "Poin", en: "Point" },
        path: "point",
        element: <MarketingCustomerPage ruleKey="marketing/customer" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
      {
        label: { id: "Voucher", en: "Voucher" },
        path: "voucher",
        element: <MarketingCustomerPage ruleKey="marketing/customer" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
      {
        label: { id: "Diskon", en: "Discount" },
        path: "discount",
        element: <MarketingCustomerPage ruleKey="marketing/customer" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
    ],
  },

  {
    label: { id: "Akuntansi", en: "Accounting" },
    path: "accounting",
    icon: "Fa6/FaFileInvoiceDollar",
    children: [
      {
        label: { id: "Bagan Akun", en: "Chart of Account" },
        path: "chart-of-account",
        element: <ChartOfAccountPage ruleKey="accounting/chart-of-account" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
      {
        label: { id: "Jurnal", en: "Journal" },
        path: "journal",
        element: <JournalPage ruleKey="accounting/journal" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
      {
        label: { id: "Buku Besar", en: "General Ledger" },
        path: "general-ledger",
        element: <GeneralLedgerPage ruleKey="accounting/general-ledger" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
      {
        label: { id: "Laba Rugi", en: "Profit and Loss" },
        path: "profit-and-loss",
        element: <ProfitAndLosePage ruleKey="accounting/profit-and-loss" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
      {
        label: { id: "Neraca", en: "Balance Sheet" },
        path: "balance-sheet",
        element: <BalanceSheetPage ruleKey="accounting/balance-sheet" />,
        strict: true,
        icon: "Hi/HiUserGroup",
      },
    ],
  },

  {
    label: { id: "Integrasi", en: "Integration" },
    path: "integration",
    icon: "Md/MdOutlineCampaign",
    children: [
      {
        label: { id: "Pasar", en: "Marketplace" },
        path: "marketplace",
        icon: "Hi/HiUserGroup",
        children: [
          {
            label: { id: "Shopee", en: "Shopee" },
            path: "shopee",
            element: (
              <MarketingCustomerPage ruleKey="integration/marketplace/shopee" />
            ),
            strict: true,
            icon: "Hi/HiUserGroup",
          },
          {
            label: { id: "Tokopedia", en: "Tokopedia" },
            path: "tokopedia",
            element: (
              <MarketingCustomerPage ruleKey="integration/marketplace/tokopedia" />
            ),
            strict: true,
            icon: "Hi/HiUserGroup",
          },
        ],
      },
      {
        label: { id: "Gerbang Pembayaran", en: "Payment Gateway" },
        path: "payment-gateway",
        icon: "Hi/HiUserGroup",
        children: [
          {
            label: { id: "Midtrans", en: "Midtrans" },
            path: "midtrans",
            element: (
              <MarketingCustomerPage ruleKey="integration/payment-gateway/midtrans" />
            ),
            strict: true,
            icon: "Hi/HiUserGroup",
          },
          {
            label: { id: "Xendit", en: "Xendit" },
            path: "xendit",
            element: (
              <MarketingCustomerPage ruleKey="integration/payment-gateway/xendit" />
            ),
            strict: true,
            icon: "Hi/HiUserGroup",
          },
          {
            label: { id: "Duitku", en: "Duitku" },
            path: "duitku",
            element: (
              <MarketingCustomerPage ruleKey="integration/payment-gateway/duitku" />
            ),
            strict: true,
            icon: "Hi/HiUserGroup",
          },
        ],
      },
    ],
  },
];

export default sidebarLinks;
