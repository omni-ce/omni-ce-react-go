package role

import (
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/role/model"
	rule "react-go/core/modules/rule/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func DivisionCreate(c *fiber.Ctx) error {
	var body struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Body tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	// Check duplicate
	var existing model.RoleDivision
	if err := variable.Db.
		Where("name = ?", body.Name).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Division name sudah ada",
			En: "Division name already exists",
		}, nil)
	}

	division := model.RoleDivision{
		Name:        body.Name,
		Description: body.Description,
	}
	if err := variable.Db.
		Create(&division).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Division name sudah ada",
				En: "Division name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat division",
			En: "Failed to create division",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Division berhasil dibuat",
		En: "Division created successfully",
	}, division)
}

func DivisionUpdate(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid ID",
		}, nil)
	}

	var body struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Body tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	var division model.RoleDivision
	if err := variable.Db.
		First(&division, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Division tidak ditemukan",
			En: "Division not found",
		}, nil)
	}

	// Check duplicate name (excluding self)
	var dup model.RoleDivision
	if err := variable.Db.
		Where("name = ? AND id != ?", body.Name, id).
		First(&dup).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Division name sudah ada",
			En: "Division name already exists",
		}, nil)
	}

	division.Name = body.Name
	division.Description = body.Description
	if err := variable.Db.
		Save(&division).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui division",
			En: "Failed to update division",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Division berhasil diperbarui",
		En: "Division updated successfully",
	}, division)
}

func DivisionDelete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid ID",
		}, nil)
	}

	var division model.RoleDivision
	if err := variable.Db.
		First(&division, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Division tidak ditemukan",
			En: "Division not found",
		}, nil)
	}

	// Get all role IDs under this division
	var roleIDs []uint
	variable.Db.
		Model(&model.Role{}).
		Where("role_division_id = ?", id).
		Pluck("id", &roleIDs)

	// Delete rules associated with those roles
	if len(roleIDs) > 0 {
		variable.Db.
			Where("role_id IN ?", roleIDs).
			Delete(&rule.Rule{})
	}

	// Delete roles under this division
	variable.Db.
		Where("role_division_id = ?", id).
		Delete(&model.Role{})

	// Delete the division
	if err := variable.Db.
		Delete(&division).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus division",
			En: "Failed to delete division",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Division berhasil dihapus",
		En: "Division deleted successfully",
	}, nil)
}

func DivisionSetActive(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid ID",
		}, nil)
	}

	var division model.RoleDivision
	if err := variable.Db.
		First(&division, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Division tidak ditemukan",
			En: "Division not found",
		}, nil)
	}

	newStatus := !division.IsActive
	if err := variable.Db.
		Model(&division).
		Update("is_active", newStatus).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengaktifkan/menonaktifkan division",
			En: "Failed to toggle division status",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Status division berhasil diubah",
		En: "Division status updated successfully",
	}, fiber.Map{
		"is_active": newStatus,
	})
}
