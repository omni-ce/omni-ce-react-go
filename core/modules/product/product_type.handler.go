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
	"gorm.io/gorm"
)

func TypeCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak ada hak akses",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		CategoryID string `json:"category_id" validate:"required"`
		Name       string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	categoryID, err := strconv.Atoi(body.CategoryID)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Kategori tidak ditemukan",
			En: "Category not found",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing product.ProductType
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Tipe dengan nama ini sudah ada",
			En: "Type with this name already exists",
		}, nil)
	}

	_type := product.ProductType{
		CategoryID: uint(categoryID),
		Key:        key,
		Name:       body.Name,
		CreatedBy:  currentUser.ID,
		UpdatedBy:  currentUser.ID,
	}

	if err := variable.Db.
		Create(&_type).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Tipe dengan nama ini sudah ada",
				En: "Type with this name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat tipe",
			En: "Failed to create type",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Tipe berhasil dibuat",
		En: "Type created",
	}, fiber.Map{
		"type": _type.Map(),
	})
}

func TypePaginate(c *fiber.Ctx) error {
	_types := make([]product.ProductType, 0)
	pagination, err := function.Pagination(c, &product.ProductType{}, func(db *gorm.DB) *gorm.DB {
		return db.Preload("Category")
	}, []string{"name", "key"}, &_types)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan data",
			En: "Failed to get data",
		}, nil)
	}

	rows := make([]map[string]any, 0, len(_types))
	for _, row := range _types {
		_type := row.Map()
		_type["category_icon"] = row.Category.Icon
		_type["category_name"] = row.Category.Name
		rows = append(rows, _type)
	}

	return dto.OK(c, types.Language{
		Id: "Tipe berhasil ditemukan",
		En: "Type found",
	}, fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func TypeEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak ada hak akses",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		CategoryID string `json:"category_id" validate:"required"`
		Name       string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var existing product.ProductType
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Tipe tidak ditemukan",
			En: "Type not found",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup product.ProductType
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, types.Language{
				Id: "Tipe dengan nama ini sudah ada",
				En: "Type with this name already exists",
			}, nil)
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui tipe",
			En: "Failed to update type",
		}, nil)
	}

	RegenerateItemKeysByAttribute("type", existing.ID)

	return dto.OK(c, types.Language{
		Id: "Tipe berhasil diperbarui",
		En: "Type updated successfully",
	}, fiber.Map{
		"type": existing.Map(),
	})
}

func TypeRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&product.ProductType{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus tipe",
			En: "Failed to delete type",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Tipe berhasil dihapus",
		En: "Type deleted successfully",
	}, nil)
}

func TypeBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.
		Delete(&product.ProductType{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus tipe",
			En: "Failed to delete type",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Tipe berhasil dihapus",
		En: "Type deleted successfully",
	}, nil)
}

func TypeSetActive(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing product.ProductType
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Tipe tidak ditemukan",
			En: "Type not found",
		}, nil)
	}

	existing.IsActive = !existing.IsActive
	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui tipe",
			En: "Failed to update type",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Tipe berhasil diperbarui",
		En: "Type updated successfully",
	}, fiber.Map{
		"type": existing.Map(),
	})
}
