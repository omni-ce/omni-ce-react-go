package notification

import (
	"react-go/middlewares"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(r fiber.Router) {
	r.Get("/next/:id", middlewares.UseToken, NextData)
	r.Post("/mark-read", middlewares.UseToken, MarkRead)
	r.Delete("/delete/:id", middlewares.UseToken, Delete)
	r.Delete("/clear-all", middlewares.UseToken, ClearAll)
}
