package dashboard

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(r fiber.Router) {
	r.Get("/stats", GetStats)

	// CRUD Widget
	r.Post("/widget/create", HelloWorld)
	r.Get("/widget/list", HelloWorld)
	r.Put("/widget/edit/:id", HelloWorld)
	r.Delete("/widget/remove/:id", HelloWorld)

}
