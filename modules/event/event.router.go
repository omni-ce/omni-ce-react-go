package event

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(r fiber.Router) {
	r.Get("/stream", Stream)
}
