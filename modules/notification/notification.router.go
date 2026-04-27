package notification

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(r fiber.Router) {
	r.Get("/next/:id", NextData)
	r.Post("/mark-read", MarkRead)
	r.Post("/toggle-read", ToggleRead)
	r.Delete("/delete/:id", Delete)
	r.Delete("/clear-all", ClearAll)
}
