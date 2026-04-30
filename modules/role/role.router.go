package role

import (
	"react-go/middlewares"

	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(r fiber.Router) {
	// division
	r.Post("/division/create", middlewares.UseRoleMenu("roles", "create"), DivisionCreate)
	r.Put("/division/edit/:id", middlewares.UseRoleMenu("roles", "update"), DivisionUpdate)
	r.Delete("/division/remove/:id", middlewares.UseRoleMenu("roles", "delete"), DivisionDelete)
	r.Patch("/division/set-active/:id", middlewares.UseRoleMenu("roles", "set"), DivisionSetActive)

	// role
	r.Get("/all", middlewares.UseRoleMenu("roles", "read"), GetAll)
	r.Post("/create", middlewares.UseRoleMenu("roles", "create"), Create)
	r.Get("/paginate", middlewares.UseRoleMenu("roles", "read"), GetPaginate)
	r.Put("/edit/:id", middlewares.UseRoleMenu("roles", "update"), Update)
	r.Delete("/remove/:id", middlewares.UseRoleMenu("roles", "delete"), Delete)
	r.Patch("/set-active/:id", middlewares.UseRoleMenu("roles", "set"), SetActive)
	r.Post("/bulk-remove", middlewares.UseRoleMenu("roles", "delete"), BulkDelete)
}
