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

func GetAll(c *fiber.Ctx) error {
	divisions := make([]model.RoleDivision, 0)
	if err := variable.Db.
		Order("name ASC").
		Find(&divisions).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch divisions", nil)
	}

	roles := make([]model.Role, 0)
	if err := variable.Db.
		Order("name ASC").
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch roles", nil)
	}

	type RoleItem struct {
		ID          uint   `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
		IsActive    bool   `json:"is_active"`
	}
	type DivisionGroup struct {
		ID          uint       `json:"id"`
		Name        string     `json:"name"`
		Description string     `json:"description"`
		IsActive    bool       `json:"is_active"`
		Roles       []RoleItem `json:"roles"`
	}

	grouped := make([]DivisionGroup, 0, len(divisions))
	for _, d := range divisions {
		group := DivisionGroup{
			ID:          d.ID,
			Name:        d.Name,
			Description: d.Description,
			IsActive:    d.IsActive,
			Roles:       make([]RoleItem, 0),
		}
		for _, r := range roles {
			if r.RoleDivisionID == d.ID {
				group.Roles = append(group.Roles, RoleItem{
					ID:          r.ID,
					Name:        r.Name,
					Description: r.Description,
					IsActive:    r.IsActive,
				})
			}
		}
		grouped = append(grouped, group)
	}

	return dto.OK(c, "Success", fiber.Map{
		"divisions": grouped,
	})
}

func Create(c *fiber.Ctx) error {
	var body struct {
		RoleDivisionID uint   `json:"role_division_id" validate:"required"`
		Name           string `json:"name" validate:"required"`
		Description    string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// Check division exists
	var division model.RoleDivision
	if err := variable.Db.
		First(&division, "id = ?", body.RoleDivisionID).
		Error; err != nil {
		return dto.NotFound(c, "Division not found", nil)
	}

	// Check duplicate
	var existing model.Role
	if err := variable.Db.
		Where("name = ?", body.Name).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Role name already exists", nil)
	}

	role := model.Role{
		RoleDivisionID: body.RoleDivisionID,
		Name:           body.Name,
		Description:    body.Description,
	}
	if err := variable.Db.
		Create(&role).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to create role", nil)
	}

	return dto.Created(c, "Role created", role)
}

func GetPaginate(c *fiber.Ctx) error {
	roles := make([]model.Role, 0)
	pagination, err := function.Pagination(c, &model.Role{}, nil, []string{"name", "description"}, &roles)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	return dto.OK(c, "Success", fiber.Map{
		"rows":       roles,
		"pagination": pagination.Meta(),
	})
}

func Update(c *fiber.Ctx) error {
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

	var role model.Role
	if err := variable.Db.
		First(&role, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Role not found", nil)
	}

	// Prevent renaming protected roles
	if (role.Name == "su" || role.Name == "user") && body.Name != role.Name {
		return dto.BadRequest(c, "Cannot rename protected role", nil)
	}

	// Check duplicate name (excluding self)
	var dup model.Role
	if err := variable.Db.
		Where("name = ? AND id != ?", body.Name, id).
		First(&dup).
		Error; err == nil {
		return dto.BadRequest(c, "Role name already exists", nil)
	}

	role.Name = body.Name
	role.Description = body.Description
	if err := variable.Db.
		Save(&role).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update role", nil)
	}

	return dto.OK(c, "Role updated", role)
}

func Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	var role model.Role
	if err := variable.Db.
		First(&role, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Role not found", nil)
	}

	// Cascade: delete rules for this role
	variable.Db.
		Where("role_id = ?", id).
		Delete(&rule.Rule{})

	if err := variable.Db.
		Delete(&role).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete role", nil)
	}

	return dto.OK(c, "Role deleted", nil)
}

func SetActive(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	var role model.Role
	if err := variable.Db.
		First(&role, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Role not found", nil)
	}

	newStatus := !role.IsActive
	if err := variable.Db.
		Model(&role).
		Update("is_active", newStatus).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle role status", nil)
	}

	return dto.OK(c, "Role status toggled", fiber.Map{
		"is_active": newStatus,
	})
}

func BulkDelete(c *fiber.Ctx) error {
	var body struct {
		IDs []uint64 `json:"ids" validate:"required,min=1,dive,gt=0"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// Cascade: delete rules for these roles
	variable.Db.
		Where("role_id IN ?", body.IDs).
		Delete(&rule.Rule{})

	if err := variable.Db.
		Delete(&model.Role{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete roles", nil)
	}

	return dto.OK(c, "Success bulk delete roles", fiber.Map{
		"deleted_count": len(body.IDs),
	})
}
