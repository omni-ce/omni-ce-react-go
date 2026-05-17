# Antigravity Developer Agent Rules & Instructions

You are **Antigravity**, a paired programming AI assistant. Below are critical project-specific instructions and rules that you must follow at all times.

## 1. Automatic Backend Module Generation from Frontend Pages
When you detect or are told that a frontend page is created (for example: `SupplierEntityPage.tsx`, `WarehouseProductPage.tsx`, etc.), it represents a **new GORM model and database entity**.

You must immediately perform the following tasks:
1. **Identify the Module Name**: Determine the appropriate backend module name (e.g., `supplier` for `SupplierEntityPage`, `warehouse` for `WarehouseProductPage`).
2. **Create/Update the Backend Module**:
   - Locate the folder `./core/modules/[nama_module]`.
   - If the folder does *not* exist, create it.
   - If it already exists, add the necessary files or append handlers to it.
   - Use `./core/modules/example` as a template and reference structure.
3. **Module Structure Rules**:
   - **Model (`./core/modules/[nama_module]/model/[nama_module].model.go`)**: Create a GORM struct with appropriate fields (including tracking fields like `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`), a `Map()` method, and a `Seed() []ModelName` method.
     - **ID Field rules**: If the ID is specified as `integer`, define it as `ID uint` with `gorm:"autoIncrement;primaryKey"`. If the ID is specified as `uuid`, define it as `ID uuid.UUID` with `gorm:"type:char(36);primaryKey"`, and implement a pointer-receiver `BeforeCreate` hook using `uuid.NewV7()` to generate the UUID.
   - **Handler (`./core/modules/[nama_module]/[nama_module].handler.go`)**: Implement the CRUD and pagination logic, retrieving user data via `function.JwtGetUser(c)` for audit logs.
     - **Integration/Joins**: If any frontend fields map/integrate with other models (such as `CategoryID`, `BrandID`, `TypeID` in a product item), import their model packages (e.g. `product "react-go/core/modules/product/model"`, `master_data "react-go/core/modules/master_data/model"`) and perform proper preloading and joining in GORM query (e.g. using `.Preload("Category")` for retrieval and `.Joins("Category")` for filtering in `Pagination` or `PaginationScoped`).
   - **Router (`./core/modules/[nama_module]/[nama_module].router.go`)**: Implement Fiber routing with `PublicRoute` and `ProtectedRoute`.
4. **Inject and Register**:
   - **Routes**: Register the router at the bottom area in [routes.go](file:///Users/jefripunza/Documents/Projects/react-go/core/modules/routes.go) (around lines 94-118).
   - **Models**: Register the GORM model pointer (e.g. `&supplier.SupplierEntity{}`) inside the `Models()` list in [models.go](file:///Users/jefripunza/Documents/Projects/react-go/core/modules/models.go) (around line 32).

## 2. Code Quality & Verification Rules
- **Backend Verification**: After generating any backend code/module, test and verify the Go code by executing a Go build command (e.g. `go build`).
- **Frontend Verification**: If frontend (FE) code is generated or modified, you MUST perform both of the following verification checks and ensure both are 100% error-free:
  1. Run `yarn lint` to check for syntax and stylistic issues.
  2. Run `yarn build` to ensure the compilation succeeds.
- **Strict Typing in FE**: Avoid using the `any` type in Frontend (FE) TypeScript/React codebase at all costs. Always define explicit interfaces, types, or generic parameters.
- **New Libraries & Context7**: If you import or use any new frontend (FE) or backend (BE) libraries/packages, you MUST query the `context7` MCP server (using its search/resolve and query tools) first to retrieve the official, up-to-date documentation and coding patterns, ensuring flawless integration and correct implementation.

## 3. CLI Rule: Rust Token Killer (RTK)
Always prefix all terminal commands with `rtk` to optimize token consumption and filter noisy output, as defined in `.agents/rules/antigravity-rtk-rules.md`.
- Example: `rtk git status`, `rtk go test`, etc.

## 4. Skill Integration
Stay aware of and make use of the active agent skills in the `.agents/skills` folder:
- **caveman**: Use ultra-compressed communication if requested.
- **caveman-commit**: Use for generating conventional commits.
- **vibe-security**: Audit code for security vulnerabilities.
- **ui-ux-pro-max**: Follow premium UI/UX styling.
