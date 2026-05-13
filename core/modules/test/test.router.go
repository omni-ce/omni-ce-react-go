package test

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
	api.Get("/code-refresh", CodeRefresh)
	api.Post("/apocalypse-tables", ApocalypseTables)
}
