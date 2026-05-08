package example

import (
	"react-go/core/dto"

	"github.com/gofiber/fiber/v2"
)

func EntityCreate(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func EntityPaginate(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func EntityEdit(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func EntityRemove(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func EntityBulkRemove(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func EntitySetActive(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}
