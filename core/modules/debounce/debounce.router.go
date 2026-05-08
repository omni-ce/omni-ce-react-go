package debounce

import (
	"github.com/gofiber/fiber/v2"
)

func ProtectedRoute(api fiber.Router) {
	api.Post("/username", Username)
	api.Post("/product-sku", ProductSKU)
}
