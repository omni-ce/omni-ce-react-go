package apikey

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(api fiber.Router) {
	api.Get("/all", GetAll)
	api.Post("/create", Create)
	api.Patch("/toggle/:id", Toggle)
	api.Delete("/remove/:id", Delete)
}
