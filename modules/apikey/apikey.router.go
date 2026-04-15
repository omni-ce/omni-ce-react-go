package apikey

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(r fiber.Router) {
	r.Get("/all", GetAll)
	r.Post("/create", Create)
	r.Patch("/toggle/:id", Toggle)
	r.Delete("/remove/:id", Delete)
}
