package user

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	api.Post("/change-password", ChangePassword)

	// Pagination CRUD convention
	api.Post("/create", Create)
	api.Get("/paginate", Paginate)
	api.Put("/edit/:id", Edit)
	api.Post("/change-password-from-user/:id", ChangePasswordFromUser)
	api.Delete("/remove/:id", Remove)
	api.Post("/bulk-remove", BulkRemove)
	api.Patch("/set-active/:id", SetActive)
}
