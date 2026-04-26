package auth

import (
	"react-go/middlewares"

	"github.com/gofiber/fiber/v2"
)

func RegisterPublicRoutes(r fiber.Router) {
	r.Post("/login", Login)
	r.Post("/logout", middlewares.UseToken, Logout)
}

func RegisterProtectedRoutes(r fiber.Router) {
	r.Get("/validate", middlewares.UseToken, Validate)
}
