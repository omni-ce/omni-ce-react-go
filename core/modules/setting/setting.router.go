package setting

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	api.Get("/all", All)
	api.Put("/set", Set)
	api.Post("/toggle-maintenance", ToggleMaintenance)
}
