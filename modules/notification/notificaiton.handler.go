package notification

import (
	"react-go/dto"

	"github.com/gofiber/fiber/v2"
)

func NextData(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func MarkRead(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func Delete(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

func ClearAll(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}
