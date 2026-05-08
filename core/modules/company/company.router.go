package example

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
	api.Get("/", HelloWorld)
}
