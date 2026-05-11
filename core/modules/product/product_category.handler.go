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

func CategoryCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Icon string `json:"icon" validate:"required"`
		Name string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Permintaan tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductCategory
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Kategori dengan nama ini sudah ada",
			En: "Category with this name already exists",
		}, nil)
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
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Kategori dengan nama ini sudah ada",
				En: "Category with this name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat kategori",
			En: "Failed to create category",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Kategori berhasil dibuat",
		En: "Category created successfully",
	}, fiber.Map{
		"category": category.Map(),
	})
}

func CategoryPaginate(c *fiber.Ctx) error {
	var categories []model.ProductCategory
	pagination, err := function.Pagination(c, &model.ProductCategory{}, nil, []string{"name", "key"}, &categories)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menyiapkan pagination",
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

func CategoryEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Icon string `json:"icon" validate:"required"`
		Name string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Permintaan tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	var existing model.ProductCategory
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Kategori tidak ditemukan",
			En: "Category not found",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductCategory
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, types.Language{
				Id: "Kategori dengan nama ini sudah ada",
				En: "Category with this name already exists",
			}, nil)
		}
	}

	existing.Key = key
	existing.Icon = body.Icon
	existing.Name = body.Name
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui kategori",
			En: "Failed to update category",
		}, nil)
	}

	RegenerateItemKeysByAttribute("category", existing.ID)

	return dto.OK(c, types.Language{
		Id: "Kategori berhasil diperbarui",
		En: "Category updated successfully",
	}, fiber.Map{
		"category": existing.Map(),
	})
}

func CategoryRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductCategory{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus kategori",
			En: "Failed to delete category",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Kategori berhasil dihapus",
		En: "Category deleted successfully",
	}, nil)
}

func CategoryBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Permintaan tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	if err := variable.Db.
		Delete(&model.ProductCategory{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus kategori",
			En: "Failed to delete category",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: fmt.Sprintf("Berhasil menghapus %d kategori", len(body.IDs)),
		En: fmt.Sprintf("Successfully deleted %d categories", len(body.IDs)),
	}, nil)
}

func CategorySetActive(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.ProductCategory
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Kategori tidak ditemukan",
			En: "Category not found",
		}, nil)
	}

	existing.IsActive = !existing.IsActive
	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui kategori",
			En: "Failed to update category",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Kategori berhasil diperbarui",
		En: "Category updated successfully",
	}, fiber.Map{
		"category": existing.Map(),
	})
}
