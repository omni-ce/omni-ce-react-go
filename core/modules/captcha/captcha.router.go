package captcha

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
	api.Get("/generate", Generate)
	api.Post("/validate", Validate)
	api.Post("/regenerate", Regenerate)
}
