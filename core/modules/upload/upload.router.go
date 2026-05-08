package upload

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(api fiber.Router) {
	api.Post("/profile", Profile)
	api.Post("/brand-logo", BrandLogo)
	api.Post("/product", Product)
}
