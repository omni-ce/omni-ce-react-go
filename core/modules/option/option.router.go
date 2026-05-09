package option

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
}

func ProtectedRoute(api fiber.Router) {
	api.Get("/divisions", Divisions)
	api.Get("/roles", Roles)
	api.Get("/roles/:id", RolesOnDivision)

	// User
	api.Get("/users", Users)

	// Company
	api.Get("/company-entities", CompanyEntities)
	api.Get("/company-branches", CompanyBranches)

	// Product
	api.Get("/product-categories", ProductCategories)
	api.Get("/product-types/:category_id", ProductTypesByCategory)
	api.Get("/product-brands", ProductBrands)
	api.Get("/product-variants/:brand_id", ProductVariant)
	api.Get("/product-memories", ProductMemories)
	api.Get("/product-colors", ProductColors)
}
