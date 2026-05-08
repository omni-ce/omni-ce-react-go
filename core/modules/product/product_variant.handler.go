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

func VariantCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		BrandID     string `json:"brand_id" validate:"required"`
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	brandID, err := strconv.Atoi(body.BrandID)
	if err != nil {
		return dto.BadRequest(c, "Invalid brand id", nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductVariant
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Variant with this name already exists", nil)
	}

	variant := model.ProductVariant{
		BrandID:     uint(brandID),
		Key:         key,
		Name:        body.Name,
		Description: body.Description,
		CreatedBy:   currentUser.ID,
		UpdatedBy:   currentUser.ID,
	}

	if err := variable.Db.
		Create(&variant).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to create variant", nil)
	}

	return dto.Created(c, "Variant created", fiber.Map{
		"variant": variant.Map(),
	})
}

func VariantPaginate(c *fiber.Ctx) error {
	variants := make([]model.ProductVariant, 0)
	pagination, err := function.Pagination(c, &model.ProductVariant{}, func(db *gorm.DB) *gorm.DB {
		return db.Preload("Brand")
	}, []string{"name", "key"}, &variants)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	rows := make([]map[string]any, 0, len(variants))
	for _, row := range variants {
		variant := row.Map()
		variant["brand_name"] = row.Brand.Name
		rows = append(rows, variant)
	}

	return dto.OK(c, "Success get variants", fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func VariantEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		BrandID     string `json:"brand_id" validate:"required"`
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.ProductVariant
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Variant not found", nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductVariant
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, "Variant with this name already exists", nil)
		}
	}

	if brandID, err := strconv.Atoi(body.BrandID); err == nil {
		existing.BrandID = uint(brandID)
	}
	existing.Key = key
	existing.Name = body.Name
	existing.Description = body.Description
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update variant", nil)
	}

	return dto.OK(c, "Variant updated", fiber.Map{
		"variant": existing.Map(),
	})
}

func VariantRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductVariant{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete variant", nil)
	}

	return dto.OK(c, "Variant deleted", nil)
}

func VariantBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.
		Delete(&model.ProductVariant{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete variants", nil)
	}

	return dto.OK(c, fmt.Sprintf("Success delete %d variants", len(body.IDs)), nil)
}

func VariantSetActive(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.ProductVariant
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Variant not found", nil)
	}

	existing.IsActive = !existing.IsActive
	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle variant status", nil)
	}

	return dto.OK(c, "Variant status updated", fiber.Map{
		"variant": existing.Map(),
	})
}
