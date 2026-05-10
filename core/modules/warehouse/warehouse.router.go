package warehouse

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(api fiber.Router) {
	// Location
	api.Post("/location/create", LocationCreate)
	api.Get("/location/paginate", LocationPaginate)
	api.Put("/location/edit/:id", LocationEdit)
	api.Delete("/location/remove/:id", LocationRemove)
	api.Post("/location/bulk-remove", LocationBulkRemove)
	api.Patch("/location/set-active/:id", LocationSetActive)

	// Product
	api.Post("/product/create", ProductCreate)
	api.Get("/product/paginate", ProductPaginate)
	api.Put("/product/edit/:id", ProductEdit)
	api.Delete("/product/remove/:id", ProductRemove)
	api.Post("/product/bulk-remove", ProductBulkRemove)
	api.Patch("/product/set-active/:id", ProductSetActive)
}
