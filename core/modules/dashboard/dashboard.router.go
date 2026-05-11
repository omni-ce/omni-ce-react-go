package dashboard

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
}

func ProtectedRoute(api fiber.Router) {
	api.Get("/functions", ListFunctions)

	// CRUD Widget
	api.Post("/widget/create", WidgetCreate)
	api.Get("/widget/list", WidgetList)
	api.Put("/widget/edit/:id", WidgetEdit)
	api.Delete("/widget/remove/:id", WidgetRemove)
}
