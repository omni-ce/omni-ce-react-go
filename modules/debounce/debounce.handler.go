package debounce

import (
	"react-go/dto"
	"react-go/function"
	"react-go/modules/user/model"
	"react-go/variable"

	"github.com/gofiber/fiber/v2"
)

func Username(c *fiber.Ctx) error {
	var body struct {
		Value string `json:"value" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.User
	if err := variable.Db.
		Where("username = ?", body.Value).
		First(&existing).
		Error; err == nil {
		return dto.OK(c, "Username not available", fiber.Map{
			"available": false,
		})
	}
	return dto.OK(c, "Username available", fiber.Map{
		"available": true,
	})
}
