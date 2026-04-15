package user

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	api.Get("/me", GetMe("management"))
	api.Get("/list", GetList)
}

// TODO: Management
func ManagementRoute(api fiber.Router) {
	api.Put("/manage/:id/edit", Edit("management"))
	api.Patch("/manage/:id/change-password", ChangePassword("management"))
}
