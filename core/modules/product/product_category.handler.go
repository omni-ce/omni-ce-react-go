package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
)

func CategoryCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Icon string `json:"icon" validate:"required"`
		Name string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductCategory
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Category with this name already exists", nil)
	}

	category := model.ProductCategory{
		Key:       key,
		Icon:      body.Icon,
		Name:      body.Name,
		CreatedBy: currentUser.ID,
		UpdatedBy: currentUser.ID,
	}

	if err := variable.Db.
		Create(&category).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to create category", nil)
	}

	return dto.Created(c, "Category created", fiber.Map{
		"category": category.Map(),
	})
}

func CategoryPaginate(c *fiber.Ctx) error {
	var categories []model.ProductCategory
	pagination, err := function.Pagination(c, &model.ProductCategory{}, nil, []string{"name", "key"}, &categories)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	rows := make([]map[string]any, 0, len(categories))
	for _, cat := range categories {
		rows = append(rows, cat.Map())
	}

	return dto.OK(c, "Success get categories", fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func CategoryEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Icon string `json:"icon" validate:"required"`
		Name string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.ProductCategory
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Category not found", nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductCategory
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, "Category with this name already exists", nil)
		}
	}

	existing.Key = key
	existing.Icon = body.Icon
	existing.Name = body.Name
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update category", nil)
	}

	return dto.OK(c, "Category updated", fiber.Map{
		"category": existing.Map(),
	})
}

func CategoryRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductCategory{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete category", nil)
	}

	return dto.OK(c, "Category deleted", nil)
}

func CategoryBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.
		Delete(&model.ProductCategory{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete categories", nil)
	}

	return dto.OK(c, fmt.Sprintf("Success delete %d categories", len(body.IDs)), nil)
}

func CategorySetActive(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.ProductCategory
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Category not found", nil)
	}

	existing.IsActive = !existing.IsActive
	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle category status", nil)
	}

	return dto.OK(c, "Category status updated", fiber.Map{
		"category": existing.Map(),
	})
}
