package upload

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(r fiber.Router) {
	r.Post("/profile", Profile)
	r.Post("/brand-logo", BrandLogo)
	r.Post("/product", Product)
}
