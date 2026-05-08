package address

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
	api.Get("/provinces", Provinces)
	api.Get("/regencies/:id", Regencies)
	api.Get("/districts/:id", Districts)
	api.Get("/villages/:id", Villages)
}
