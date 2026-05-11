package example

import (
	"react-go/core/dto"
	"react-go/core/types"

	"github.com/gofiber/fiber/v2"
)

func HelloWorld(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}
