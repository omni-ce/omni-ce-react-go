package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
)

func BrandCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Logo string `json:"logo" validate:"required"`
		Name string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductBrand
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Brand with this name already exists", nil)
	}

	brand := model.ProductBrand{
		Key:       key,
		Logo:      body.Logo,
		Name:      body.Name,
		CreatedBy: currentUser.ID,
		UpdatedBy: currentUser.ID,
	}

	if err := variable.Db.
		Create(&brand).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to create brand", nil)
	}

	return dto.Created(c, "Brand created", fiber.Map{
		"brand": brand.Map(),
	})
}

func BrandPaginate(c *fiber.Ctx) error {
	var categories []model.ProductBrand
	pagination, err := function.Pagination(c, &model.ProductBrand{}, nil, []string{"name", "key"}, &categories)
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

func BrandEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Logo string `json:"logo" validate:"required"`
		Name string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.ProductBrand
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Brand not found", nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductBrand
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, "Brand with this name already exists", nil)
		}
	}

	existing.Key = key
	existing.Logo = body.Logo
	existing.Name = body.Name
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update brand", nil)
	}

	RegenerateItemKeysByAttribute("brand", existing.ID)

	return dto.OK(c, "Brand updated", fiber.Map{
		"brand": existing.Map(),
	})
}

func BrandRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductBrand{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete brand", nil)
	}

	return dto.OK(c, "Brand deleted", nil)
}

func BrandBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.
		Delete(&model.ProductBrand{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete categories", nil)
	}

	return dto.OK(c, fmt.Sprintf("Success delete %d categories", len(body.IDs)), nil)
}

func BrandSetActive(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.ProductBrand
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Brand not found", nil)
	}

	existing.IsActive = !existing.IsActive
	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle brand status", nil)
	}

	return dto.OK(c, "Brand status updated", fiber.Map{
		"brand": existing.Map(),
	})
}
