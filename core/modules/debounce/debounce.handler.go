package debounce

import (
	"react-go/core/dto"
	"react-go/core/function"
	product "react-go/core/modules/product/model"
	user "react-go/core/modules/user/model"
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

	var existing user.User
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

func ProductSKU(c *fiber.Ctx) error {
	var body struct {
		Value string `json:"value" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing product.ProductItem
	if err := variable.Db.
		Where("sku = ?", body.Value).
		First(&existing).
		Error; err == nil {
		return dto.OK(c, "SKU already used", fiber.Map{
			"available": false,
			"message": fiber.Map{
				"id": "SKU sudah digunakan",
				"en": "SKU already used",
			},
		})
	}
	return dto.OK(c, "SKU available", fiber.Map{
		"available": true,
		"message": fiber.Map{
			"id": "SKU tersedia",
			"en": "SKU available",
		},
	})
}
