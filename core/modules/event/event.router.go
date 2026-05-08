package event

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(api fiber.Router) {
	api.Get("/stream", Stream)
	api.Get("/dashboard", Dashboard)
}
