package example

import (
	"react-go/core/dto"

	"github.com/gofiber/fiber/v2"
)

func HelloWorld(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}
