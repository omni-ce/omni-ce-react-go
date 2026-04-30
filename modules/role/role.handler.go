package role

import (
	"react-go/dto"
	"react-go/function"
	model "react-go/modules/role/model"
	user "react-go/modules/user/model"
	"react-go/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func Create(c *fiber.Ctx) error {
	var req struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &req); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// Check duplicate
	var existing model.Role
	if err := variable.Db.Where("name = ?", req.Name).First(&existing).Error; err == nil {
		return dto.BadRequest(c, "Role name already exists", nil)
	}

	role := model.Role{
		Name:        req.Name,
		Description: req.Description,
	}
	if err := variable.Db.Create(&role).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create role", nil)
	}

	return dto.Created(c, "Role created", role)
}

func GetPaginate(c *fiber.Ctx) error {
	roles := make([]model.Role, 0)
	pagination, err := function.Pagination(c, &model.Role{}, []string{"name", "description"}, &roles)
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
	if err := variable.Db.First(&role, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, "Role not found", nil)
	}

	// Prevent renaming protected roles
	if (role.Name == "su" || role.Name == "user") && req.Name != role.Name {
		return dto.BadRequest(c, "Cannot rename protected role", nil)
	}

	// Check duplicate name (excluding self)
	var dup model.Role
	if err := variable.Db.Where("name = ? AND id != ?", req.Name, id).First(&dup).Error; err == nil {
		return dto.BadRequest(c, "Role name already exists", nil)
	}

	role.Name = req.Name
	role.Description = req.Description
	if err := variable.Db.Save(&role).Error; err != nil {
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

	if err := variable.Db.
		Delete(&role).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete role", nil)
	}

	return dto.OK(c, "Role deleted", nil)
}

func SetActive(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid user id", nil)
	}

	// Only SU can toggle active status
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	if currentUser.Role != user.UserRoleAdmin {
		return dto.Forbidden(c, "Only super admin can toggle user status", nil)
	}

	var existing user.User
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "User not found", nil)
	}

	// Prevent deactivating self
	if existing.ID == currentUser.ID {
		return dto.BadRequest(c, "Cannot deactivate yourself", nil)
	}

	newStatus := !existing.IsActive
	if err := variable.Db.
		Model(&existing).
		Update("is_active", newStatus).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle user status", nil)
	}

	return dto.OK(c, "Success toggle user status", fiber.Map{
		"user": existing.Map(),
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

	if err := variable.Db.
		Delete(&model.Role{}, "id IN ?", req.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete roles", nil)
	}

	return dto.OK(c, "Success bulk delete roles", fiber.Map{
		"deleted_count": len(req.IDs),
	})
}
