package upload

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(r fiber.Router) {
	r.Post("/profile", Profile)
}
