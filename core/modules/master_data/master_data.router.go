package master_data

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	// Unit
	api.Get("/unit/paginate", UnitPaginate)
	api.Post("/unit/create", UnitCreate)
	api.Put("/unit/edit/:id", UnitEdit)
	api.Delete("/unit/remove/:id", UnitRemove)
	api.Post("/unit/bulk-remove", UnitBulkRemove)
}
