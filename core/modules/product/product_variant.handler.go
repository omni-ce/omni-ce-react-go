package product

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func VariantCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		TypeID      string `json:"type_id" validate:"required"`
		BrandID     string `json:"brand_id" validate:"required"`
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Permintaan tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	typeID, err := strconv.Atoi(body.TypeID)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Tipe tidak valid",
			En: "Invalid type id",
		}, nil)
	}

	brandID, err := strconv.Atoi(body.BrandID)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Brand tidak valid",
			En: "Invalid brand id",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key
	var existing model.ProductVariant
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Variant dengan nama ini sudah ada",
			En: "Variant with this name already exists",
		}, nil)
	}

	variant := model.ProductVariant{
		TypeID:      uint(typeID),
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
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Variant dengan nama ini sudah ada",
				En: "Variant with this name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat variant",
			En: "Failed to create variant",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Variant berhasil dibuat",
		En: "Variant created successfully",
	}, fiber.Map{
		"variant": variant.Map(),
	})
}

func VariantPaginate(c *fiber.Ctx) error {
	variants := make([]model.ProductVariant, 0)
	pagination, err := function.Pagination(c, &model.ProductVariant{}, func(db *gorm.DB) *gorm.DB {
		return db.Preload("Type").Preload("Brand")
	}, []string{"name", "key"}, &variants)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan data variant",
			En: "Failed to get variant data",
		}, nil)
	}

	typeIds := make([]uint, 0)
	for _, row := range variants {
		typeIds = append(typeIds, row.TypeID)
	}
	_types := make([]model.ProductType, 0)
	if err := variable.Db.
		Where("id IN ?", typeIds).
		Find(&_types).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan tipe",
			En: "Failed to get types",
		}, nil)
	}
	typeMap := make(map[uint]model.ProductType)
	for _, t := range _types {
		typeMap[t.ID] = t
	}

	categoryIds := make([]uint, 0)
	for _, row := range variants {
		categoryIds = append(categoryIds, typeMap[row.TypeID].CategoryID)
	}
	categories := make([]model.ProductCategory, 0)
	if err := variable.Db.
		Where("id IN ?", categoryIds).
		Find(&categories).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan kategori",
			En: "Failed to get categories",
		}, nil)
	}
	categoryMap := make(map[uint]model.ProductCategory)
	for _, t := range categories {
		categoryMap[t.ID] = t
	}

	rows := make([]map[string]any, 0, len(variants))
	for _, row := range variants {

		variant := row.Map()
		variant["category_name"] = categoryMap[typeMap[row.TypeID].CategoryID].Name
		variant["category_icon"] = categoryMap[typeMap[row.TypeID].CategoryID].Icon
		variant["type_name"] = typeMap[row.TypeID].Name
		variant["brand_name"] = row.Brand.Name
		variant["brand_logo"] = row.Brand.Logo
		rows = append(rows, variant)
	}

	return dto.OK(c, types.Language{
		Id: "Variant berhasil diambil",
		En: "Variant retrieved successfully",
	}, fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func VariantEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		TypeID      string `json:"type_id" validate:"required"`
		BrandID     string `json:"brand_id" validate:"required"`
		Name        string `json:"name" validate:"required"`
		Description string `json:"description"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Permintaan tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	var existing model.ProductVariant
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Variant tidak ditemukan",
			En: "Variant not found",
		}, nil)
	}

	key := generateKeyFromName(body.Name)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductVariant
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, types.Language{
				Id: "Variant dengan nama ini sudah ada",
				En: "Variant with this name already exists",
			}, nil)
		}
	}

	if typeID, err := strconv.Atoi(body.TypeID); err == nil {
		existing.TypeID = uint(typeID)
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui variant",
			En: "Failed to update variant",
		}, nil)
	}

	RegenerateItemKeysByAttribute("variant", existing.ID)

	return dto.OK(c, types.Language{
		Id: "Variant berhasil diperbarui",
		En: "Variant updated successfully",
	}, fiber.Map{
		"variant": existing.Map(),
	})
}

func VariantRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductVariant{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus variant",
			En: "Failed to delete variant",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Variant berhasil dihapus",
		En: "Variant deleted successfully",
	}, nil)
}

func VariantBulkRemove(c *fiber.Ctx) error {
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
		Delete(&model.ProductVariant{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus variant",
			En: "Failed to delete variant",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Variant berhasil dihapus",
		En: "Variant deleted successfully",
	}, nil)
}

func VariantSetActive(c *fiber.Ctx) error {
	id := c.Params("id")

	var existing model.ProductVariant
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Variant tidak ditemukan",
			En: "Variant not found",
		}, nil)
	}

	existing.IsActive = !existing.IsActive
	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengaktifkan/menonaktifkan variant",
			En: "Failed to toggle variant status",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Variant berhasil diaktifkan/dinonaktifkan",
		En: "Variant status updated successfully",
	}, fiber.Map{
		"variant": existing.Map(),
	})
}
