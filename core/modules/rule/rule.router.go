package rule

import (
	"react-go/core/middlewares"

	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	api.Post("/set", middlewares.UseRoleMenu("roles", "set"), Set)
	api.Get("/list", middlewares.UseRoleMenu("roles", "read"), List)
}
