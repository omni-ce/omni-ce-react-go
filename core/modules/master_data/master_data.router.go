package master_data

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	api.Get("/paginate", GetPaginate)
	api.Post("/create", Create)
	api.Put("/edit/:id", Update)
	api.Delete("/remove/:id", Delete)
	api.Post("/bulk-remove", BulkDelete)
}
