package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func TypeCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		CategoryID string `json:"category_id" validate:"required"`
		Name       string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	categoryID, err := strconv.Atoi(body.CategoryID)
	if err != nil {
		return dto.BadRequest(c, "Invalid category id", nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductType
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Type with this name already exists", nil)
	}

	_type := model.ProductType{
		CategoryID: uint(categoryID),
		Key:        key,
		Name:       body.Name,
		CreatedBy:  currentUser.ID,
		UpdatedBy:  currentUser.ID,
	}

	if err := variable.Db.
		Create(&_type).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to create type", nil)
	}

	return dto.Created(c, "Type created", fiber.Map{
		"type": _type.Map(),
	})
}

func TypePaginate(c *fiber.Ctx) error {
	types := make([]model.ProductType, 0)
	pagination, err := function.Pagination(c, &model.ProductType{}, func(db *gorm.DB) *gorm.DB {
		return db.Preload("Category")
	}, []string{"name", "key"}, &types)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	rows := make([]map[string]any, 0, len(types))
	for _, row := range types {
		_type := row.Map()
		_type["category_icon"] = row.Category.Icon
		_type["category_name"] = row.Category.Name
		rows = append(rows, _type)
	}

	return dto.OK(c, "Success get types", fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func TypeEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		CategoryID string `json:"category_id" validate:"required"`
		Name       string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.ProductType
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Type not found", nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductType
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, "Type with this name already exists", nil)
		}
	}

	if categoryID, err := strconv.Atoi(body.CategoryID); err == nil {
		existing.CategoryID = uint(categoryID)
	}
	existing.Key = key
	existing.Name = body.Name
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update type", nil)
	}

	return dto.OK(c, "Type updated", fiber.Map{
		"type": existing.Map(),
	})
}

func TypeRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductType{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete type", nil)
	}

	return dto.OK(c, "Type deleted", nil)
}

func TypeBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.
		Delete(&model.ProductType{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete types", nil)
	}

	return dto.OK(c, fmt.Sprintf("Success delete %d types", len(body.IDs)), nil)
}

func TypeSetActive(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.ProductType
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Type not found", nil)
	}

	existing.IsActive = !existing.IsActive
	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle type status", nil)
	}

	return dto.OK(c, "Type status updated", fiber.Map{
		"type": existing.Map(),
	})
}
