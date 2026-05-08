package product

import (
	"react-go/core/dto"

	"github.com/gofiber/fiber/v2"
)

func HelloWorld(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

// --------------------------------------- //

func CategoryCreate(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func CategoryPaginate(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func CategoryEdit(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func CategoryRemove(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func CategoryBulkRemove(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func CategorySetActive(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}
