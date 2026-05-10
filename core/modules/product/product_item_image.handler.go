package product

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func ItemImageSet(c *fiber.Ctx) error {
	itemId := c.Params("item_id")

	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Images []struct {
			Url       string `json:"url" validate:"required,url"`
			IsPrimary bool   `json:"is_primary"`
		} `json:"images" validate:"required,min=1,dive"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	itemIdInt, err := strconv.Atoi(itemId)
	if err != nil {
		return dto.BadRequest(c, "Invalid item id", nil)
	}

	err = variable.Db.Transaction(func(tx *gorm.DB) error {
		// 1. Delete all existing images for this item
		if err := tx.Delete(&model.ProductItemImage{}, "item_id = ?", itemIdInt).Error; err != nil {
			return err
		}

		// 2. Insert new ones
		for _, img := range body.Images {
			newImg := model.ProductItemImage{
				ID:         uuid.New(),
				ItemID:     uint(itemIdInt),
				Url:        img.Url,
				IsPrimary:  img.IsPrimary,
				UploadedBy: currentUser.ID,
			}
			if err := tx.Create(&newImg).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return dto.InternalServerError(c, "Failed to update images", nil)
	}

	return dto.OK(c, "Images updated successfully", nil)
}

func ItemImageList(c *fiber.Ctx) error {
	itemId := c.Params("item_id")

	var images []model.ProductItemImage
	if err := variable.Db.
		Where("item_id = ?", itemId).
		Order("is_primary DESC, uploaded_at ASC").
		Find(&images).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to get images", nil)
	}

	rows := make([]map[string]any, 0, len(images))
	for _, img := range images {
		rows = append(rows, img.Map())
	}

	return dto.OK(c, "Success get images", fiber.Map{
		"rows": rows,
	})
}

func ItemImageRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	idUUID, err := uuid.Parse(id)
	if err != nil {
		return dto.BadRequest(c, "Invalid image id", nil)
	}

	if err := variable.Db.
		Delete(&model.ProductItemImage{}, "id = ?", idUUID).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete image", nil)
	}

	return dto.OK(c, "Image deleted", nil)
}

func ItemImageSetPrimary(c *fiber.Ctx) error {
	id := c.Params("id")
	idUUID, err := uuid.Parse(id)
	if err != nil {
		return dto.BadRequest(c, "Invalid image id", nil)
	}

	var target model.ProductItemImage
	if err := variable.Db.First(&target, "id = ?", idUUID).Error; err != nil {
		return dto.NotFound(c, "Image not found", nil)
	}

	err = variable.Db.Transaction(func(tx *gorm.DB) error {
		// 1. Unset all primary for this item
		if err := tx.Model(&model.ProductItemImage{}).
			Where("item_id = ?", target.ItemID).
			Update("is_primary", false).Error; err != nil {
			return err
		}
		// 2. Set this one as primary
		if err := tx.Model(&target).Where("id = ?", idUUID).Update("is_primary", true).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return dto.InternalServerError(c, "Failed to set primary image", nil)
	}

	return dto.OK(c, "Primary image updated", nil)
}
