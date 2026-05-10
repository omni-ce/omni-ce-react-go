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
- [ ] `src/index.css` — Global CSS tokens, font, animations
- [ ] `index.html` — Google Fonts Poppins import
- [ ] `src/stores/themeStore.ts` — Default to light mode

---

## Phase 1: Base UI Components (`src/components/ui/`)
- [ ] `src/components/ui/Button.tsx`
- [ ] `src/components/ui/Card.tsx`
- [ ] `src/components/ui/Input.tsx`
- [ ] `src/components/ui/Badge.tsx`
- [ ] `src/components/ui/Dialog.tsx`
- [ ] `src/components/ui/Table.tsx`
- [ ] `src/components/ui/Select.tsx`
- [ ] `src/components/ui/Label.tsx`
- [ ] `src/components/ui/Switch.tsx`
- [ ] `src/components/ui/Stepper.tsx`
- [ ] `src/components/ui/Avatar.tsx`
- [ ] `src/components/ui/SearchableSelect.tsx`
- [ ] `src/components/ui/CodeBlock.tsx`
- [ ] `src/components/ui/ColorPickerSelector.tsx`
- [ ] `src/components/ui/CameraSelector.tsx`
- [ ] `src/components/ui/CaptchaInput.tsx`
- [ ] `src/components/ui/CountrySelector.tsx`
- [ ] `src/components/ui/FlagSelector.tsx`
- [ ] `src/components/ui/IconSelector.tsx`
- [ ] `src/components/ui/LanguageSelector.tsx`
- [ ] `src/components/ui/MapPicker.tsx`
- [ ] `src/components/ui/PhoneNumber.tsx`

---

## Phase 2: Shared Components (`src/components/`)
- [ ] `src/components/ControlButton.tsx`
- [ ] `src/components/Loading.tsx`
- [ ] `src/components/SectionTitle.tsx`
- [ ] `src/components/StatCard.tsx`
- [ ] `src/components/StatusBadge.tsx`
- [ ] `src/components/Tab.tsx`
- [ ] `src/components/NotificationPopup.tsx`
- [ ] `src/components/Pagination.tsx`
- [ ] `src/components/DynamicForm.tsx`
- [ ] `src/components/RoleStepper.tsx`
- [ ] `src/components/Image.tsx`
- [ ] `src/components/JsonEditor.tsx`
- [ ] `src/components/LineChart.tsx`

---

## Phase 3: Widget Components (`src/components/widget/`)
- [ ] `src/components/widget/WidgetAreaChart.tsx`
- [ ] `src/components/widget/WidgetColumnChart.tsx`
- [ ] `src/components/widget/WidgetDonutChart.tsx`
- [ ] `src/components/widget/WidgetGaugeChart.tsx`
- [ ] `src/components/widget/WidgetLineChart.tsx`
- [ ] `src/components/widget/WidgetProgressList.tsx`
- [ ] `src/components/widget/WidgetTableList.tsx`
- [ ] `src/components/widget/WidgetTrafficStats.tsx`

---

## Phase 4: Layouts (`src/layouts/`)
- [ ] `src/layouts/AppLayout.tsx`
- [ ] `src/layouts/AuthLayout.tsx`
- [ ] `src/layouts/PublicLayout.tsx`

---

## Phase 5: Pages — Auth (`src/pages/auth/`)
- [ ] `src/pages/auth/LoginPage.tsx`
- [ ] `src/pages/auth/SelectRolePage.tsx`

---

## Phase 6: Pages — Error (`src/pages/error/`)
- [ ] `src/pages/error/ErrorBoundaryPage.tsx`
- [ ] `src/pages/error/NotFoundPage.tsx`
- [ ] `src/pages/error/RulePermissionPage.tsx`

---

## Phase 7: Pages — Public (`src/pages/public/`)
- [ ] `src/pages/public/LandingPage.tsx`

---

## Phase 8: Pages — System (`src/pages/system/`)
- [ ] `src/pages/system/DashboardPage.tsx`
- [ ] `src/pages/system/notification/NotificationPage.tsx`
- [ ] `src/pages/system/notification/config.tsx`
- [ ] `src/pages/system/notification/message.tsx`
- [ ] `src/pages/system/role/RolePage.tsx`
- [ ] `src/pages/system/user/UserPage.tsx`
- [ ] `src/pages/system/user/action.tsx`

---

## Phase 9: Pages — App (`src/pages/app/`)
- [ ] `src/pages/app/pos/PosPage.tsx`
- [ ] `src/pages/app/setting/SettingPage.tsx`
- [ ] `src/pages/app/company/CompanyBranchPage.tsx`
- [ ] `src/pages/app/company/CompanyEntityPage.tsx`
- [ ] `src/pages/app/example/ExamplePage.tsx`
- [ ] `src/pages/app/marketing/MarketingCustomerPage.tsx`
- [ ] `src/pages/app/master_data/MasterDataPage.tsx`
- [ ] `src/pages/app/master_data/TabUnitPage.tsx`
- [ ] `src/pages/app/product/ProductBrandPage.tsx`
- [ ] `src/pages/app/product/ProductCategoryPage.tsx`
- [ ] `src/pages/app/product/ProductColorPage.tsx`
- [ ] `src/pages/app/product/ProductItemPage.tsx`
- [ ] `src/pages/app/product/ProductMemoryPage.tsx`
- [ ] `src/pages/app/product/ProductTypePage.tsx`
- [ ] `src/pages/app/product/ProductVariantPage.tsx`
- [ ] `src/pages/app/warehouse/WarehouseLocationPage.tsx`
- [ ] `src/pages/app/warehouse/WarehouseProductPage.tsx`

---

## Phase 10: Pages — Documentation (`src/pages/doc/`)
- [ ] `src/pages/doc/index.tsx`
- [ ] `src/pages/doc/Introduction.tsx`
- [ ] `src/pages/doc/QuickStart.tsx`
- [ ] `src/pages/doc/TechStack.tsx`
- [ ] `src/pages/doc/Theming.tsx`
- [ ] `src/pages/doc/AddingPages.tsx`
- [ ] `src/pages/doc/ProjectStructure.tsx`

---

## Phase 11: Other TSX Files
- [ ] `src/App.tsx` — (minimal: theme default)
- [ ] `src/PWABadge.tsx` + `src/PWABadge.css`
- [ ] `src/dummy.tsx`
- [ ] `src/routers.tsx` — (no visual)
- [ ] `src/sidebar.tsx` — (no visual)
- [ ] `src/main.tsx` — (no visual)

---

## Total Files: **88 TSX + 2 CSS + 1 HTML = 91 files**
