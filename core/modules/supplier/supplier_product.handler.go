package supplier

import (
	"react-go/core/dto"
	"react-go/core/types"

	"github.com/gofiber/fiber/v2"
)

func ProductCreate(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func ProductPaginate(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func ProductEdit(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func ProductRemove(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func ProductBulkRemove(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func ProductSetActive(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}
