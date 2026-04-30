package option

import "github.com/gofiber/fiber/v2"

func PublicRoute(r fiber.Router) {
}

func ProtectedRoute(r fiber.Router) {
	r.Get("/divisions", Divisions)
	r.Get("/roles/:id", Roles)
}
