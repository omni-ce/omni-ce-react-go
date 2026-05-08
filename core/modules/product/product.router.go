package product

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
	api.Get("/", HelloWorld)
}

func ProtectedRoute(api fiber.Router) {
	// Category
	api.Post("/category/create", CategoryCreate)
	api.Get("/category/paginate", CategoryPaginate)
	api.Put("/category/edit/:id", CategoryEdit)
	api.Delete("/category/remove/:id", CategoryRemove)
	api.Post("/category/bulk-remove", CategoryBulkRemove)
	api.Patch("/category/set-active/:id", CategorySetActive)

	// Brand
	api.Post("/brand/create", BrandCreate)
	api.Get("/brand/paginate", BrandPaginate)
	api.Put("/brand/edit/:id", BrandEdit)
	api.Delete("/brand/remove/:id", BrandRemove)
	api.Post("/brand/bulk-remove", BrandBulkRemove)
	api.Patch("/brand/set-active/:id", BrandSetActive)
}
