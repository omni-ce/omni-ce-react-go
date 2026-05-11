package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
)

func ConditionCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductCondition
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Condition with this name already exists", nil)
	}

	condition := model.ProductCondition{
		Key:         key,
		Name:        body.Name,
		Description: body.Description,
		CreatedBy:   currentUser.ID,
		UpdatedBy:   currentUser.ID,
	}

	if err := variable.Db.
		Create(&condition).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to create condition", nil)
	}

	return dto.Created(c, "Condition created", fiber.Map{
		"condition": condition.Map(),
	})
}

func ConditionPaginate(c *fiber.Ctx) error {
	var categories []model.ProductCondition
	pagination, err := function.Pagination(c, &model.ProductCondition{}, nil, []string{"name", "key"}, &categories)
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

func ConditionEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.ProductCondition
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Condition not found", nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductCondition
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, "Condition with this name already exists", nil)
		}
	}

	existing.Key = key
	existing.Name = body.Name
	existing.Description = body.Description
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update condition", nil)
	}

	RegenerateItemKeysByAttribute("condition", existing.ID)

	return dto.OK(c, "Condition updated", fiber.Map{
		"condition": existing.Map(),
	})
}

func ConditionRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductCondition{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete condition", nil)
	}

	return dto.OK(c, "Condition deleted", nil)
}

func ConditionBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.
		Delete(&model.ProductCondition{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete categories", nil)
	}

	return dto.OK(c, fmt.Sprintf("Success delete %d categories", len(body.IDs)), nil)
}
