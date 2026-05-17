package master_data

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	master_data "react-go/core/modules/master_data/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func UnitCreate(c *fiber.Ctx) error {
	var body struct {
		Name      string `json:"name" validate:"required"`
		ShortName string `json:"short_name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	// Check duplicate key
	var existing master_data.Unit
	if err := variable.Db.
		Where("short_name = ?", body.ShortName).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Satuan dengan singkatan ini sudah ada",
			En: "Unit with this short name already exists",
		}, nil)
	}

	unit := master_data.Unit{
		Name:      body.Name,
		ShortName: body.ShortName,
	}

	if err := variable.Db.
		Create(&unit).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Satuan dengan nama ini sudah ada",
				En: "Unit with this name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat satuan",
			En: "Failed to create unit",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Satuan berhasil dibuat",
		En: "Unit created successfully",
	}, fiber.Map{
		"unit": unit,
	})
}

func UnitPaginate(c *fiber.Ctx) error {
	var units []master_data.Unit
	pagination, err := function.Pagination(c, &master_data.Unit{}, nil, []string{"name", "short_name"}, &units)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menyiapkan pagination",
			En: "Failed to prepare pagination",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Satuan berhasil diambil",
		En: "Units retrieved successfully",
	}, fiber.Map{
		"rows":       units,
		"pagination": pagination.Meta(),
	})
}

func UnitEdit(c *fiber.Ctx) error {
	id := c.Params("id")

	var body struct {
		Name      string `json:"name" validate:"required"`
		ShortName string `json:"short_name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var existing master_data.Unit
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Satuan tidak ditemukan",
			En: "Unit not found",
		}, nil)
	}

	// Check duplicate key if changed
	if body.ShortName != existing.ShortName {
		var dup master_data.Unit
		if err := variable.Db.
			Where("short_name = ? AND id != ?", body.ShortName, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, types.Language{
				Id: "Satuan dengan nama ini sudah ada",
				En: "Unit with this name already exists",
			}, nil)
		}
	}

	existing.Name = body.Name
	existing.ShortName = body.ShortName

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui satuan",
			En: "Failed to update unit",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Satuan berhasil diperbarui",
		En: "Unit updated successfully",
	}, fiber.Map{
		"unit": existing,
	})
}

func UnitRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&master_data.Unit{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus satuan",
			En: "Failed to delete unit",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Satuan berhasil dihapus",
		En: "Unit deleted successfully",
	}, nil)
}

func UnitBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.
		Delete(&master_data.Unit{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus satuan",
			En: "Failed to delete unit",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: fmt.Sprintf("Berhasil menghapus %d satuan", len(body.IDs)),
		En: fmt.Sprintf("Successfully deleted %d units", len(body.IDs)),
	}, nil)
}
