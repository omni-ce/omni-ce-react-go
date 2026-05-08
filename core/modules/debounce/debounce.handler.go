package debounce

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/user/model"
	"react-go/core/variable"

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
			"message": fiber.Map{
				"id": "Username sudah digunakan",
				"en": "Username already used",
			},
		})
	}
	return dto.OK(c, "Username available", fiber.Map{
		"available": true,
		"message": fiber.Map{
			"id": "Username tersedia",
			"en": "Username available",
		},
	})
}
