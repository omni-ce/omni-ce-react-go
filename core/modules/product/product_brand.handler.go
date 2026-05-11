package product

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func BrandCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Logo string `json:"logo" validate:"required"`
		Name string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductBrand
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Brand dengan nama ini sudah ada",
			En: "Brand with this name already exists",
		}, nil)
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
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Brand dengan nama ini sudah ada",
				En: "Brand with this name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat brand",
			En: "Failed to create brand",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Brand berhasil dibuat",
		En: "Brand created successfully",
	}, fiber.Map{
		"brand": brand.Map(),
	})
}

func BrandPaginate(c *fiber.Ctx) error {
	var categories []model.ProductBrand
	pagination, err := function.Pagination(c, &model.ProductBrand{}, nil, []string{"name", "key"}, &categories)
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

func BrandEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Logo string `json:"logo" validate:"required"`
		Name string `json:"name" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var existing model.ProductBrand
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Brand tidak ditemukan",
			En: "Brand not found",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductBrand
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, types.Language{
				Id: "Brand dengan nama ini sudah ada",
				En: "Brand with this name already exists",
			}, nil)
		}
	}

	existing.Key = key
	existing.Logo = body.Logo
	existing.Name = body.Name
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui brand",
			En: "Failed to update brand",
		}, nil)
	}

	RegenerateItemKeysByAttribute("brand", existing.ID)

	return dto.OK(c, types.Language{
		Id: "Brand berhasil diperbarui",
		En: "Brand updated successfully",
	}, fiber.Map{
		"brand": existing.Map(),
	})
}

func BrandRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductBrand{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus brand",
			En: "Failed to delete brand",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Brand berhasil dihapus",
		En: "Brand deleted successfully",
	}, nil)
}

func BrandBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.
		Delete(&model.ProductBrand{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus brand",
			En: "Failed to delete brand",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Brand berhasil dihapus",
		En: "Brand deleted successfully",
	}, nil)
}

func BrandSetActive(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.ProductBrand
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Brand tidak ditemukan",
			En: "Brand not found",
		}, nil)
	}

	existing.IsActive = !existing.IsActive
	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengaktifkan/menonaktifkan brand",
			En: "Failed to toggle brand status",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Status brand berhasil diubah",
		En: "Brand status updated successfully",
	}, fiber.Map{
		"brand": existing.Map(),
	})
}
