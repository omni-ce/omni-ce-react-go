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
   - **Router (`./core/modules/[nama_module]/[nama_module].router.go`)**: Implement Fiber routing with `PublicRoute` and `ProtectedRoute`.
4. **Inject and Register**:
   - **Routes**: Register the router at the bottom area in [routes.go](file:///Users/jefripunza/Documents/Projects/react-go/core/modules/routes.go) (around lines 94-118).
   - **Models**: Register the GORM model pointer (e.g. `&supplier.SupplierEntity{}`) inside the `Models()` list in [models.go](file:///Users/jefripunza/Documents/Projects/react-go/core/modules/models.go) (around line 32).

## 2. CLI Rule: Rust Token Killer (RTK)
Always prefix all terminal commands with `rtk` to optimize token consumption and filter noisy output, as defined in `.agents/rules/antigravity-rtk-rules.md`.
- Example: `rtk git status`, `rtk go test`, etc.

## 3. Skill Integration
Stay aware of and make use of the active agent skills in the `.agents/skills` folder:
- **caveman**: Use ultra-compressed communication if requested.
- **caveman-commit**: Use for generating conventional commits.
- **vibe-security**: Audit code for security vulnerabilities.
- **ui-ux-pro-max**: Follow premium UI/UX styling.
