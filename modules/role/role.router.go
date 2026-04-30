package role

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(r fiber.Router) {
	r.Get("/all", GetAll)
	r.Get("/paginate", GetPaginate)
	r.Post("/create", Create)
	r.Put("/edit/:id", Update)
	r.Delete("/remove/:id", Delete)
	r.Post("/bulk-remove", BulkDelete)
	r.Patch("/set-active/:id", SetActive)
}
