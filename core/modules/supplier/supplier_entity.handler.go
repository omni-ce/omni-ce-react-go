package supplier

import (
	"react-go/core/dto"
	"react-go/core/types"

	"github.com/gofiber/fiber/v2"
)

func EntityCreate(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func EntityPaginate(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func EntityEdit(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func EntityRemove(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func EntityBulkRemove(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}

func EntitySetActive(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo Dunia!",
		En: "Hello World!",
	}, nil)
}
