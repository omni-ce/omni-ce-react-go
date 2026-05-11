package address

import (
	"react-go/core/dto"
	"react-go/core/function/location"
	"react-go/core/types"

	"github.com/gofiber/fiber/v2"
)

func Provinces(c *fiber.Ctx) error {
	data, err := location.GetProvinces()
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan provinsi",
			En: "Failed to fetch provinces",
		}, nil)
	}
	return dto.OK(c, types.Language{
		Id: "Provinsi berhasil didapatkan",
		En: "Province fetched successfully!",
	}, data)
}

func Regencies(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := location.GetRegencies(id)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan kabupaten",
			En: "Failed to fetch regencies",
		}, nil)
	}
	return dto.OK(c, types.Language{
		Id: "Kabupaten berhasil didapatkan",
		En: "Regencies fetched successfully!",
	}, data)
}

func Districts(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := location.GetDistricts(id)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan kecamatan",
			En: "Failed to fetch districts",
		}, nil)
	}
	return dto.OK(c, types.Language{
		Id: "Kecamatan berhasil didapatkan",
		En: "Districts fetched successfully!",
	}, data)
}

func Villages(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := location.GetVillages(id)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan desa",
			En: "Failed to fetch villages",
		}, nil)
	}
	return dto.OK(c, types.Language{
		Id: "Desa berhasil didapatkan",
		En: "Villages fetched successfully!",
	}, data)
}

func Get(c *fiber.Ctx) error {
	id := c.Params("id")

	fullAddress, err, isBadRequest := location.GetFull(id)
	if err != nil {
		if isBadRequest {
			return dto.BadRequest(c, types.Language{
				Id: "Gagal mendapatkan alamat",
				En: "Failed to fetch address",
			}, fiber.Map{
				"error": err.Error(),
			})
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan alamat",
			En: "Failed to fetch address",
		}, fiber.Map{
			"error": err.Error(),
		})
	}

	return dto.OK(c, types.Language{
		Id: "Alamat berhasil didapatkan",
		En: "Address fetched successfully!",
	}, fullAddress)
}
