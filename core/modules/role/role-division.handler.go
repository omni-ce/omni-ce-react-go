package role

import (
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/role/model"
	rule "react-go/core/modules/rule/model"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func DivisionCreate(c *fiber.Ctx) error {
	var body struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// Check duplicate
	var existing model.RoleDivision
	if err := variable.Db.
		Where("name = ?", body.Name).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Division name already exists", nil)
	}

	division := model.RoleDivision{
		Name:        body.Name,
		Description: body.Description,
	}
	if err := variable.Db.
		Create(&division).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to create division", nil)
	}

	return dto.Created(c, "Division created", division)
}

func DivisionUpdate(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	var body struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var division model.RoleDivision
	if err := variable.Db.
		First(&division, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Division not found", nil)
	}

	// Check duplicate name (excluding self)
	var dup model.RoleDivision
	if err := variable.Db.
		Where("name = ? AND id != ?", body.Name, id).
		First(&dup).
		Error; err == nil {
		return dto.BadRequest(c, "Division name already exists", nil)
	}

	division.Name = body.Name
	division.Description = body.Description
	if err := variable.Db.
		Save(&division).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update division", nil)
	}

	return dto.OK(c, "Division updated", division)
}

func DivisionDelete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	var division model.RoleDivision
	if err := variable.Db.
		First(&division, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Division not found", nil)
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
		return dto.InternalServerError(c, "Failed to delete division", nil)
	}

	return dto.OK(c, "Division deleted", nil)
}

func DivisionSetActive(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	var division model.RoleDivision
	if err := variable.Db.
		First(&division, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Division not found", nil)
	}

	newStatus := !division.IsActive
	if err := variable.Db.
		Model(&division).
		Update("is_active", newStatus).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle division status", nil)
	}

	return dto.OK(c, "Division status toggled", fiber.Map{
		"is_active": newStatus,
	})
}
