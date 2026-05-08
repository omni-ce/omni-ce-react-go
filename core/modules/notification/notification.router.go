package notification

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	api.Get("/next/:id", NextData)
	api.Post("/mark-read", MarkRead)
	api.Post("/toggle-read", ToggleRead)
	api.Delete("/delete/:id", Delete)
	api.Delete("/clear-all", ClearAll)
}
