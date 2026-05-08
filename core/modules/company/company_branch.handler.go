package example

import (
	"react-go/core/dto"

	"github.com/gofiber/fiber/v2"
)

func BranchCreate(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func BranchPaginate(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func BranchEdit(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func BranchRemove(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func BranchBulkRemove(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func BranchSetActive(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}
