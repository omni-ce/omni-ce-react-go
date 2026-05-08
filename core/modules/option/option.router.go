package option

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
}

func ProtectedRoute(api fiber.Router) {
	api.Get("/divisions", Divisions)
	api.Get("/roles", Roles)
	api.Get("/roles/:id", RolesOnDivision)

	// Product
	api.Get("/product-categories", ProductCategories)
	api.Get("/product-brands", ProductBrands)
}
