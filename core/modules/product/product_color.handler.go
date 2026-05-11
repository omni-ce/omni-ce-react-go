package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func ColorCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotorisasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Name    string `json:"name" validate:"required"`
		HexCode string `json:"hex_code" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Gagal mendapatkan request body",
			En: "Failed to get request body",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductColor
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Nama warna sudah ada",
			En: "Color with this name already exists",
		}, nil)
	}

	color := model.ProductColor{
		Key:       key,
		Name:      body.Name,
		HexCode:   body.HexCode,
		CreatedBy: currentUser.ID,
		UpdatedBy: currentUser.ID,
	}

	if err := variable.Db.
		Create(&color).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Nama warna sudah ada",
				En: "Color with this name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat warna",
			En: "Failed to create color",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Warna berhasil dibuat",
		En: "Color created successfully",
	}, fiber.Map{
		"color": color.Map(),
	})
}

func ColorPaginate(c *fiber.Ctx) error {
	var categories []model.ProductColor
	pagination, err := function.Pagination(c, &model.ProductColor{}, nil, []string{"name", "key"}, &categories)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menyiapkan paginasi",
			En: "Failed to prepare pagination",
		}, nil)
	}

	rows := make([]map[string]any, 0, len(categories))
	for _, cat := range categories {
		rows = append(rows, cat.Map())
	}

	return dto.OK(c, types.Language{
		Id: "Kategori berhasil diambil",
		En: "Categories retrieved successfully",
	}, fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func ColorEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotorisasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Name    string `json:"name" validate:"required"`
		HexCode string `json:"hex_code" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Gagal mendapatkan request body",
			En: "Failed to get request body",
		}, nil)
	}

	var existing model.ProductColor
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Warna tidak ditemukan",
			En: "Color not found",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductColor
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, types.Language{
				Id: "Warna dengan nama ini sudah ada",
				En: "Color with this name already exists",
			}, nil)
		}
	}

	existing.Key = key
	existing.Name = body.Name
	existing.HexCode = body.HexCode
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui warna",
			En: "Failed to update color",
		}, nil)
	}

	RegenerateItemKeysByAttribute("color", existing.ID)

	return dto.OK(c, types.Language{
		Id: "Warna berhasil diperbarui",
		En: "Color updated successfully",
	}, fiber.Map{
		"color": existing.Map(),
	})
}

func ColorRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductColor{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus warna",
			En: "Failed to delete color",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Warna berhasil dihapus",
		En: "Color deleted successfully",
	}, nil)
}

func ColorBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Gagal mendapatkan request body",
			En: "Failed to get request body",
		}, nil)
	}

	if err := variable.Db.
		Delete(&model.ProductColor{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus warna",
			En: "Failed to delete color",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: fmt.Sprintf("Berhasil menghapus %d warna", len(body.IDs)),
		En: fmt.Sprintf("Success delete %d colors", len(body.IDs)),
	}, nil)
}
