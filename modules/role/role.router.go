package role

import (
	"react-go/middlewares"

	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(r fiber.Router) {
	r.Post("/create", middlewares.UseRoleMenu("role", "create"), Create)
	r.Get("/paginate", middlewares.UseRoleMenu("role", "read"), GetPaginate)
	r.Put("/edit/:id", middlewares.UseRoleMenu("role", "update"), Update)
	r.Delete("/remove/:id", middlewares.UseRoleMenu("role", "delete"), Delete)
	r.Patch("/set-active/:id", middlewares.UseRoleMenu("role", "set"), SetActive)
	r.Post("/bulk-remove", middlewares.UseRoleMenu("role", "delete"), BulkDelete)
}
