package supplier

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	// Entity
	api.Post("/entity/create", EntityCreate)
	api.Get("/entity/paginate", EntityPaginate)
	api.Put("/entity/edit/:id", EntityEdit)
	api.Delete("/entity/remove/:id", EntityRemove)
	api.Post("/entity/bulk-remove", EntityBulkRemove)
	api.Patch("/entity/set-active/:id", EntitySetActive)

	// Product
	api.Post("/product/create", ProductCreate)
	api.Get("/product/paginate", ProductPaginate)
	api.Put("/product/edit/:id", ProductEdit)
	api.Delete("/product/remove/:id", ProductRemove)
	api.Post("/product/bulk-remove", ProductBulkRemove)
	api.Patch("/product/set-active/:id", ProductSetActive)
}
