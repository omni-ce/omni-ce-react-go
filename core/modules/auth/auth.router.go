package auth

import (
	"github.com/gofiber/fiber/v2"
)

func PublicRoute(api fiber.Router) {
	api.Post("/login", Login)
}

func ProtectedRoute(api fiber.Router) {
	api.Post("/logout", Logout)
	api.Get("/validate", Validate)
}
