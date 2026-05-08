package example

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
	// Entity
	api.Post("/entity/create", EntityCreate)
	api.Get("/entity/paginate", EntityPaginate)
	api.Put("/entity/edit/:id", EntityEdit)
	api.Delete("/entity/remove/:id", EntityRemove)
	api.Post("/entity/bulk-remove", EntityBulkRemove)
	api.Patch("/entity/set-active/:id", EntitySetActive)

	// Branch
	api.Post("/branch/create", BranchCreate)
	api.Get("/branch/paginate", BranchPaginate)
	api.Put("/branch/edit/:id", BranchEdit)
	api.Delete("/branch/remove/:id", BranchRemove)
	api.Post("/branch/bulk-remove", BranchBulkRemove)
	api.Patch("/branch/set-active/:id", BranchSetActive)
}
