package captcha

import "github.com/gofiber/fiber/v2"

func PublicRoute(r fiber.Router) {
	r.Get("/generate", Generate)
	r.Post("/validate", Validate)
	r.Post("/regenerate", Regenerate)
}
