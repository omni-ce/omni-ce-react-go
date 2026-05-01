package user

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	api.Get("/me", Me("management"))

	// Pagination CRUD convention
	api.Post("/create", Create)
	api.Get("/paginate", Paginate)
	api.Put("/edit/:id", Edit)
	api.Delete("/remove/:id", Remove)
	api.Post("/bulk-remove", BulkRemove)
	api.Patch("/set-active/:id", SetActive)
}
