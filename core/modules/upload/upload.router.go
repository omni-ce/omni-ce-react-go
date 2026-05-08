package upload

import "github.com/gofiber/fiber/v2"

func ProtectedRoute(api fiber.Router) {
	api.Post("/:bucket_name", Bucket)
}
