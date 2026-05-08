package role

import (
	"react-go/core/middlewares"

	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	// division
	api.Post("/division/create", middlewares.UseRoleMenu("roles", "create"), DivisionCreate)
	api.Put("/division/edit/:id", middlewares.UseRoleMenu("roles", "update"), DivisionUpdate)
	api.Delete("/division/remove/:id", middlewares.UseRoleMenu("roles", "delete"), DivisionDelete)
	api.Patch("/division/set-active/:id", middlewares.UseRoleMenu("roles", "set"), DivisionSetActive)

	// role
	api.Get("/all", middlewares.UseRoleMenu("roles", "read"), GetAll)
	api.Post("/create", middlewares.UseRoleMenu("roles", "create"), Create)
	api.Get("/paginate", middlewares.UseRoleMenu("roles", "read"), GetPaginate)
	api.Put("/edit/:id", middlewares.UseRoleMenu("roles", "update"), Update)
	api.Delete("/remove/:id", middlewares.UseRoleMenu("roles", "delete"), Delete)
	api.Patch("/set-active/:id", middlewares.UseRoleMenu("roles", "set"), SetActive)
	api.Post("/bulk-remove", middlewares.UseRoleMenu("roles", "delete"), BulkDelete)
}
