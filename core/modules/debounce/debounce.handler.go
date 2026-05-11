package debounce

import (
	"react-go/core/dto"
	"react-go/core/function"
	product "react-go/core/modules/product/model"
	user "react-go/core/modules/user/model"
	"react-go/core/types"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Username(c *fiber.Ctx) error {
	var body struct {
		Value string `json:"value" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var existing user.User
	if err := variable.Db.
		Session(&gorm.Session{Logger: logger.Default.LogMode(logger.Silent)}). // silent mode to avoid noise
		Where("username = ?", body.Value).
		First(&existing).
		Error; err == nil {
		return dto.OK(c, types.Language{
			Id: "Username tidak tersedia",
			En: "Username not available",
		}, fiber.Map{
			"available": false,
			"message": fiber.Map{
				"id": "Username sudah digunakan",
				"en": "Username already used",
			},
		})
	}
	return dto.OK(c, types.Language{
		Id: "Username tersedia",
		En: "Username available",
	}, fiber.Map{
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
		return dto.BodyBadRequest(c, err)
	}

	var existing product.ProductItem
	if err := variable.Db.
		Session(&gorm.Session{Logger: logger.Default.LogMode(logger.Silent)}). // silent mode to avoid noise
		Where("sku = ?", body.Value).
		First(&existing).
		Error; err == nil {
		return dto.OK(c, types.Language{
			Id: "SKU tidak tersedia",
			En: "SKU not available",
		}, fiber.Map{
			"available": false,
			"message": fiber.Map{
				"id": "SKU sudah digunakan",
				"en": "SKU already used",
			},
		})
	}
	return dto.OK(c, types.Language{
		Id: "SKU tersedia",
		En: "SKU available",
	}, fiber.Map{
		"available": true,
		"message": fiber.Map{
			"id": "SKU tersedia",
			"en": "SKU available",
		},
	})
}

func ProductIMEI(c *fiber.Ctx) error {
	var body struct {
		Value string `json:"value" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var existing product.ProductItem
	if err := variable.Db.
		Session(&gorm.Session{Logger: logger.Default.LogMode(logger.Silent)}). // silent mode to avoid noise
		Where("sku_imei = ?", body.Value).
		First(&existing).
		Error; err == nil {
		return dto.OK(c, types.Language{
			Id: "SKU IMEI tidak tersedia",
			En: "SKU IMEI not available",
		}, fiber.Map{
			"available": false,
			"message": fiber.Map{
				"id": "SKU IMEI sudah digunakan",
				"en": "SKU IMEI already used",
			},
		})
	}
	return dto.OK(c, types.Language{
		Id: "SKU IMEI tersedia",
		En: "SKU IMEI available",
	}, fiber.Map{
		"available": true,
		"message": fiber.Map{
			"id": "SKU IMEI tersedia",
			"en": "SKU IMEI available",
		},
	})
}
