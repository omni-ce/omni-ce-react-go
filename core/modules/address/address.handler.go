package address

import (
	"react-go/core/dto"
	"react-go/core/function/location"

	"github.com/gofiber/fiber/v2"
)

func Provinces(c *fiber.Ctx) error {
	data, err := location.GetProvinces()
	if err != nil {
		return dto.InternalServerError(c, "Internal Server Error", nil)
	}
	return dto.OK(c, "Province fetched successfully!", data)
}

func Regencies(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := location.GetRegencies(id)
	if err != nil {
		return dto.InternalServerError(c, "Internal Server Error", nil)
	}
	return dto.OK(c, "Regencies fetched successfully!", data)
}

func Districts(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := location.GetDistricts(id)
	if err != nil {
		return dto.InternalServerError(c, "Internal Server Error", nil)
	}
	return dto.OK(c, "Districts fetched successfully!", data)
}

func Villages(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := location.GetVillages(id)
	if err != nil {
		return dto.InternalServerError(c, "Internal Server Error", nil)
	}
	return dto.OK(c, "Villages fetched successfully!", data)
}

func Get(c *fiber.Ctx) error {
	id := c.Params("id")

	fullAddress, err, isBadRequest := location.GetFull(id)
	if err != nil {
		if isBadRequest {
			return dto.BadRequest(c, err.Error(), nil)
		}
		return dto.InternalServerError(c, err.Error(), nil)
	}

	return dto.OK(c, "Address retrieved successfully!", fullAddress)
}
