package product

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func ItemImageSet(c *fiber.Ctx) error {
	itemId := c.Params("item_id")

	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Images []string `json:"images" validate:"required,min=1,dive,url"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	itemIdInt, err := strconv.Atoi(itemId)
	if err != nil {
		return dto.BadRequest(c, "Invalid item id", nil)
	}

	_type := model.ProductItemImage{
		ItemID:    uint(itemIdInt),
		URL:       body.Images,
		CreatedBy: currentUser.ID,
		UpdatedBy: currentUser.ID,
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

func ItemImageList(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductType{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete type", nil)
	}

	return dto.OK(c, "Type deleted", nil)
}

func ItemImageRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductType{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete type", nil)
	}

	return dto.OK(c, "Type deleted", nil)
}

func ItemImageSetPrimary(c *fiber.Ctx) error {
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
