# TARGET REDESIGN — monday.com Style

> **Design Pattern:** monday.com vibrant light workspace
> **Theme:** Light-first, Poppins font, Interactive Violet (#6161ff) primary
> **Rule:** NO functional changes — visual/CSS only

## Status Legend
- `[ ]` = Not started
- `[/]` = In progress
- `[x]` = Completed

---

## Phase 0: Design Foundation
- [x] `src/index.css` — Global CSS tokens, font, animations
- [x] `index.html` — Google Fonts Poppins import
- [x] `src/stores/themeStore.ts` — Default to light mode

---

## Phase 1: Base UI Components (`src/components/ui/`)
- [x] `src/components/ui/Button.tsx`
- [x] `src/components/ui/Card.tsx`
- [x] `src/components/ui/Input.tsx`
- [x] `src/components/ui/Badge.tsx`
- [x] `src/components/ui/Dialog.tsx`
- [x] `src/components/ui/Table.tsx`
- [x] `src/components/ui/Select.tsx`
- [x] `src/components/ui/Label.tsx`
- [x] `src/components/ui/Switch.tsx`
- [x] `src/components/ui/Stepper.tsx`
- [x] `src/components/ui/Avatar.tsx`
- [x] `src/components/ui/SearchableSelect.tsx`
- [x] `src/components/ui/CodeBlock.tsx` — (via bulk sed, font-mono preserved)
- [x] `src/components/ui/ColorPickerSelector.tsx` — (via bulk sed)
- [x] `src/components/ui/CameraSelector.tsx` — (via bulk sed)
- [x] `src/components/ui/CaptchaInput.tsx` — (via bulk sed)
- [x] `src/components/ui/CountrySelector.tsx` — (via bulk sed)
- [x] `src/components/ui/FlagSelector.tsx` — (via bulk sed)
- [x] `src/components/ui/IconSelector.tsx` — (via bulk sed)
- [x] `src/components/ui/LanguageSelector.tsx` — (via bulk sed)
- [x] `src/components/ui/MapPicker.tsx` — (via bulk sed)
- [x] `src/components/ui/PhoneNumber.tsx` — (via bulk sed)

---

## Phase 2: Shared Components (`src/components/`)
- [x] `src/components/ControlButton.tsx`
- [x] `src/components/Loading.tsx`
- [x] `src/components/SectionTitle.tsx`
- [x] `src/components/StatCard.tsx`
- [x] `src/components/StatusBadge.tsx`
- [x] `src/components/Tab.tsx`
- [x] `src/components/NotificationPopup.tsx`
- [x] `src/components/Pagination.tsx`
- [x] `src/components/DynamicForm.tsx`
- [x] `src/components/RoleStepper.tsx` — (via bulk sed)
- [x] `src/components/Image.tsx` — (via bulk sed)
- [x] `src/components/JsonEditor.tsx` — (via bulk sed)
- [x] `src/components/LineChart.tsx` — (via bulk sed)

---

## Phase 3: Widget Components (`src/components/widget/`)
- [x] `src/components/widget/WidgetAreaChart.tsx` — (via bulk sed)
- [x] `src/components/widget/WidgetColumnChart.tsx` — (via bulk sed)
- [x] `src/components/widget/WidgetDonutChart.tsx` — (via bulk sed)
- [x] `src/components/widget/WidgetGaugeChart.tsx` — (via bulk sed)
- [x] `src/components/widget/WidgetLineChart.tsx` — (via bulk sed)
- [x] `src/components/widget/WidgetProgressList.tsx` — (via bulk sed)
- [x] `src/components/widget/WidgetTableList.tsx` — (via bulk sed)
- [x] `src/components/widget/WidgetTrafficStats.tsx` — (via bulk sed)

---

## Phase 4: Layouts (`src/layouts/`)
- [x] `src/layouts/AppLayout.tsx`
- [x] `src/layouts/AuthLayout.tsx`
- [x] `src/layouts/PublicLayout.tsx` — (via bulk sed)

---

## Phase 5: Pages — Auth (`src/pages/auth/`)
- [x] `src/pages/auth/LoginPage.tsx`
- [x] `src/pages/auth/SelectRolePage.tsx` — (via bulk sed)

---

## Phase 6: Pages — Error (`src/pages/error/`)
- [x] `src/pages/error/ErrorBoundaryPage.tsx`
- [x] `src/pages/error/NotFoundPage.tsx`
- [x] `src/pages/error/RulePermissionPage.tsx`

---

## Phase 7: Pages — Public (`src/pages/public/`)
- [x] `src/pages/public/LandingPage.tsx` — (via bulk sed)

---

## Phase 8: Pages — System (`src/pages/system/`)
- [x] `src/pages/system/DashboardPage.tsx` — (via bulk sed)
- [x] `src/pages/system/notification/NotificationPage.tsx` — (via bulk sed)
- [x] `src/pages/system/notification/config.tsx` — (via bulk sed)
- [x] `src/pages/system/notification/message.tsx` — (via bulk sed)
- [x] `src/pages/system/role/RolePage.tsx` — (via bulk sed)
- [x] `src/pages/system/user/UserPage.tsx` — (via bulk sed)
- [x] `src/pages/system/user/action.tsx` — (via bulk sed)

---

## Phase 9: Pages — App (`src/pages/app/`)
- [x] `src/pages/app/pos/PosPage.tsx`
- [x] `src/pages/app/setting/SettingPage.tsx` — (via bulk sed)
- [x] `src/pages/app/company/CompanyBranchPage.tsx` — (via bulk sed)
- [x] `src/pages/app/company/CompanyEntityPage.tsx` — (via bulk sed)
- [x] `src/pages/app/example/ExamplePage.tsx` — (via bulk sed)
- [x] `src/pages/app/marketing/MarketingCustomerPage.tsx` — (via bulk sed)
- [x] `src/pages/app/master_data/MasterDataPage.tsx` — (via bulk sed)
- [x] `src/pages/app/master_data/TabUnitPage.tsx` — (via bulk sed)
- [x] `src/pages/app/product/ProductBrandPage.tsx` — (via bulk sed)
- [x] `src/pages/app/product/ProductCategoryPage.tsx` — (via bulk sed)
- [x] `src/pages/app/product/ProductColorPage.tsx` — (via bulk sed)
- [x] `src/pages/app/product/ProductItemPage.tsx` — (via bulk sed)
- [x] `src/pages/app/product/ProductMemoryPage.tsx` — (via bulk sed)
- [x] `src/pages/app/product/ProductTypePage.tsx` — (via bulk sed)
- [x] `src/pages/app/product/ProductVariantPage.tsx` — (via bulk sed)
- [x] `src/pages/app/warehouse/WarehouseLocationPage.tsx` — (via bulk sed)
- [x] `src/pages/app/warehouse/WarehouseProductPage.tsx` — (via bulk sed)

---

## Phase 10: Pages — Documentation (`src/pages/doc/`)
- [x] `src/pages/doc/index.tsx` — (via bulk sed)
- [x] `src/pages/doc/Introduction.tsx` — (via bulk sed)
- [x] `src/pages/doc/QuickStart.tsx` — (via bulk sed)
- [x] `src/pages/doc/TechStack.tsx` — (via bulk sed)
- [x] `src/pages/doc/Theming.tsx` — (via bulk sed)
- [x] `src/pages/doc/AddingPages.tsx` — (via bulk sed)
- [x] `src/pages/doc/ProjectStructure.tsx` — (via bulk sed)

---

## Phase 11: Other TSX Files
- [x] `src/App.tsx` — (minimal: theme default)
- [x] `src/PWABadge.tsx` + `src/PWABadge.css` — (via bulk sed)
- [x] `src/dummy.tsx` — (via bulk sed)
- [x] `src/routers.tsx` — (no visual)
- [x] `src/sidebar.tsx` — (no visual)
- [x] `src/main.tsx` — (no visual)

---

## Total Files: **88 TSX + 2 CSS + 1 HTML = 91 files**
## Completion: ✅ ALL FILES PROCESSED
