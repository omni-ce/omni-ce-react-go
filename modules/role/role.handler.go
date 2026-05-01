package role

import (
	"react-go/dto"
	"react-go/function"
	model "react-go/modules/role/model"
	rule "react-go/modules/rule/model"
	"react-go/variable"
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
	var req struct {
		RoleDivisionID uint   `json:"role_division_id" validate:"required"`
		Name           string `json:"name" validate:"required"`
		Description    string `json:"description"`
	}
	if err := function.RequestBody(c, &req); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// Check division exists
	var division model.RoleDivision
	if err := variable.Db.
		First(&division, "id = ?", req.RoleDivisionID).
		Error; err != nil {
		return dto.NotFound(c, "Division not found", nil)
	}

	// Check duplicate
	var existing model.Role
	if err := variable.Db.
		Where("name = ?", req.Name).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Role name already exists", nil)
	}

	role := model.Role{
		RoleDivisionID: req.RoleDivisionID,
		Name:           req.Name,
		Description:    req.Description,
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

	var req struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &req); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var role model.Role
	if err := variable.Db.
		First(&role, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Role not found", nil)
	}

	// Prevent renaming protected roles
	if (role.Name == "su" || role.Name == "user") && req.Name != role.Name {
		return dto.BadRequest(c, "Cannot rename protected role", nil)
	}

	// Check duplicate name (excluding self)
	var dup model.Role
	if err := variable.Db.
		Where("name = ? AND id != ?", req.Name, id).
		First(&dup).
		Error; err == nil {
		return dto.BadRequest(c, "Role name already exists", nil)
	}

	role.Name = req.Name
	role.Description = req.Description
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
	var req struct {
		IDs []uint64 `json:"ids"`
	}
	if err := c.BodyParser(&req); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	if len(req.IDs) == 0 {
		return dto.BadRequest(c, "No IDs provided", nil)
	}

	// Cascade: delete rules for these roles
	variable.Db.
		Where("role_id IN ?", req.IDs).
		Delete(&rule.Rule{})

	if err := variable.Db.
		Delete(&model.Role{}, "id IN ?", req.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete roles", nil)
	}

	return dto.OK(c, "Success bulk delete roles", fiber.Map{
		"deleted_count": len(req.IDs),
	})
}
