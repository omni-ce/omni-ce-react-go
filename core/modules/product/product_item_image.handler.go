package product

import (
	"react-go/core/dto"
	"react-go/core/function"
	product "react-go/core/modules/product/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func ItemImageSet(c *fiber.Ctx) error {
	itemId := c.Params("item_id")

	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak ada hak akses",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Url string `json:"url" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	itemIdInt, err := strconv.Atoi(itemId)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID item tidak valid",
			En: "Invalid item ID",
		}, nil)
	}

	err = variable.Db.Transaction(func(tx *gorm.DB) error {
		var count int64
		if err := tx.Model(&product.ProductItemImage{}).Where("item_id = ?", itemIdInt).Count(&count).Error; err != nil {
			return err
		}

		isPrimary := count == 0

		newImg := product.ProductItemImage{
			ItemID:     uint(itemIdInt),
			Url:        body.Url,
			IsPrimary:  isPrimary,
			UploadedBy: currentUser.ID,
		}
		return tx.Create(&newImg).Error
	})
	if err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Image with this url already exists",
				En: "Image with this url already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengubah gambar",
			En: "Failed to update images",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Gambar berhasil diubah",
		En: "Images updated successfully",
	}, nil)
}

func ItemImageList(c *fiber.Ctx) error {
	itemId := c.Params("item_id")

	var images []product.ProductItemImage
	if err := variable.Db.
		Where("item_id = ?", itemId).
		Order("is_primary DESC, uploaded_at ASC").
		Find(&images).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengambil gambar",
			En: "Failed to get images",
		}, nil)
	}

	rows := make([]map[string]any, 0, len(images))
	for _, img := range images {
		rows = append(rows, img.Map())
	}

	return dto.OK(c, types.Language{
		Id: "Gambar berhasil diambil",
		En: "Images retrieved successfully",
	}, fiber.Map{
		"rows": rows,
	})
}

func ItemImageRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	idUUID, err := uuid.Parse(id)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID gambar tidak valid",
			En: "Invalid image ID",
		}, nil)
	}

	if err := variable.Db.
		Delete(&product.ProductItemImage{}, "id = ?", idUUID).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus gambar",
			En: "Failed to delete image",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Gambar berhasil dihapus",
		En: "Image deleted successfully",
	}, nil)
}

func ItemImageSetPrimary(c *fiber.Ctx) error {
	id := c.Params("id")
	idUUID, err := uuid.Parse(id)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID gambar tidak valid",
			En: "Invalid image ID",
		}, nil)
	}

	var target product.ProductItemImage
	if err := variable.Db.
		First(&target, "id = ?", idUUID).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Gambar tidak ditemukan",
			En: "Image not found",
		}, nil)
	}

	err = variable.Db.Transaction(func(tx *gorm.DB) error {
		// 1. Unset all primary for this item
		if err := tx.Model(&product.ProductItemImage{}).
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengatur gambar utama",
			En: "Failed to set primary image",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Gambar utama berhasil diatur",
		En: "Primary image set successfully",
	}, nil)
}
