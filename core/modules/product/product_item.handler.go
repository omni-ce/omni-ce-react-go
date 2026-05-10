package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ItemCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		CategoryID string `json:"category_id" validate:"required"`
		TypeID     string `json:"type_id" validate:"required"`
		BrandID    string `json:"brand_id" validate:"required"`
		VariantID  string `json:"varian_id" validate:"required"`
		MemoryID   string `json:"memory_id"`
		ColorID    string `json:"color_id" validate:"required"`
		SKU        string `json:"sku" validate:"required"`
		SkuIMEI    string `json:"sku_imei"`
	}

	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// Convert IDs
	categoryID, err := strconv.Atoi(body.CategoryID)
	if err != nil {
		return dto.BadRequest(c, "Invalid category ID", nil)
	}
	typeID, err := strconv.Atoi(body.TypeID)
	if err != nil {
		return dto.BadRequest(c, "Invalid type ID", nil)
	}
	brandID, err := strconv.Atoi(body.BrandID)
	if err != nil {
		return dto.BadRequest(c, "Invalid brand ID", nil)
	}
	variantID, err := strconv.Atoi(body.VariantID)
	if err != nil {
		return dto.BadRequest(c, "Invalid variant ID", nil)
	}
	colorID, err := strconv.Atoi(body.ColorID)
	if err != nil {
		return dto.BadRequest(c, "Invalid color ID", nil)
	}

	ColorID := uint(colorID)

	var memoryID *uint
	if body.MemoryID != "" {
		if mid, err := strconv.Atoi(body.MemoryID); err == nil {
			uMid := uint(mid)
			memoryID = &uMid
		}
	}

	// Check duplicate SKU
	var existing model.ProductItem
	if err := variable.Db.
		Session(&gorm.Session{Logger: logger.Default.LogMode(logger.Silent)}). // silent mode to avoid noise
		Where("sku = ?", body.SKU).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Item with this SKU already exists", nil)
	}

	item := model.ProductItem{
		CategoryID: uint(categoryID),
		TypeID:     uint(typeID),
		BrandID:    uint(brandID),
		VariantID:  uint(variantID),
		MemoryID:   memoryID,
		ColorID:    &ColorID,
		SKU:        body.SKU,
		SkuIMEI:    body.SkuIMEI,
		CreatedBy:  currentUser.ID,
		UpdatedBy:  currentUser.ID,
	}

	if err := variable.Db.
		Create(&item).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to create product item", nil)
	}

	return dto.Created(c, "Product item created", fiber.Map{
		"item": item.Map(),
	})
}

func ItemPaginate(c *fiber.Ctx) error {
	/*
		http://localhost:3000/api/product/item/paginate
		?page=1&limit=10
		&search_fields=sku,category_name,type_name,brand_name,varian_name
		&col_sku=a&col_category_name=b&col_type_name=c&col_brand_name=d&col_varian_name=e
	*/
	col_sku := c.Query("col_sku")
	col_category_name := c.Query("col_category_name")
	col_type_name := c.Query("col_type_name")
	col_brand_name := c.Query("col_brand_name")
	col_varian_name := c.Query("col_varian_name")

	items := make([]model.ProductItem, 0)

	// Buat query dasar dengan Preload untuk data dan Joins untuk filter
	query := variable.Db.Model(&model.ProductItem{}).
		Preload("Category").
		Preload("Type").
		Preload("Brand").
		Preload("Variant").
		Preload("Memory").
		Preload("Color")

	// Filter SKU & IMEI (Manual karena butuh OR)
	if col_sku != "" {
		// Hapus col_sku dari query agar tidak diproses otomatis oleh Pagination (menghindari double filter AND)
		c.Request().URI().QueryArgs().Del("col_sku")

		search := "%" + strings.ToLower(col_sku) + "%"
		query = query.Where("(LOWER(product_items.sku) LIKE ? OR LOWER(product_items.sku_imei) LIKE ?)", search, search)
	}

	// Filter Kolom Join (Harus pakai Joins agar tabel tersedia untuk Where)
	if col_category_name != "" {
		query = query.Joins("Category").Where("LOWER(Category.name) LIKE ?", "%"+strings.ToLower(col_category_name)+"%")
	}
	if col_type_name != "" {
		query = query.Joins("Type").Where("LOWER(Type.name) LIKE ?", "%"+strings.ToLower(col_type_name)+"%")
	}
	if col_brand_name != "" {
		query = query.Joins("Brand").Where("LOWER(Brand.name) LIKE ?", "%"+strings.ToLower(col_brand_name)+"%")
	}
	if col_varian_name != "" {
		query = query.Joins("Variant").Where("LOWER(Variant.name) LIKE ?", "%"+strings.ToLower(col_varian_name)+"%")
	}

	// Gunakan PaginationScoped agar Count menyertakan filter Join & Where di atas
	pagination, err := function.PaginationScoped(c, query, &model.ProductItem{}, []string{}, &items)

	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	rows := make([]map[string]any, 0, len(items))
	for _, row := range items {
		item := row.Map()
		// Inject relationship names for FE display
		item["category_name"] = row.Category.Name
		item["type_name"] = row.Type.Name
		item["brand_name"] = row.Brand.Name
		item["varian_name"] = row.Variant.Name
		if row.MemoryID != nil {
			item["memory_name"] = fmt.Sprintf("%d GB / %d GB", row.Memory.Ram, row.Memory.InternalStorage)
		}
		item["color_name"] = row.Color.Name
		item["color_hex"] = row.Color.HexCode

		rows = append(rows, item)
	}

	return dto.OK(c, "Success get product items", fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func ItemEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		CategoryID string `json:"category_id" validate:"required"`
		TypeID     string `json:"type_id" validate:"required"`
		BrandID    string `json:"brand_id" validate:"required"`
		VariantID  string `json:"varian_id" validate:"required"`
		MemoryID   string `json:"memory_id"`
		ColorID    string `json:"color_id" validate:"required"`
		SKU        string `json:"sku" validate:"required"`
		SkuIMEI    string `json:"sku_imei"`
	}

	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.ProductItem
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Product item not found", nil)
	}

	// Check duplicate SKU if changed
	if body.SKU != existing.SKU {
		var dup model.ProductItem
		if err := variable.Db.
			Where("sku = ? AND id != ?", body.SKU, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, "Item with this SKU already exists", nil)
		}
	}

	// Update fields
	catID, err := strconv.Atoi(body.CategoryID)
	if err != nil {
		return dto.BadRequest(c, "Invalid category ID", nil)
	}
	existing.CategoryID = uint(catID)
	typeID, err := strconv.Atoi(body.TypeID)
	if err != nil {
		return dto.BadRequest(c, "Invalid type ID", nil)
	}
	existing.TypeID = uint(typeID)
	brID, err := strconv.Atoi(body.BrandID)
	if err != nil {
		return dto.BadRequest(c, "Invalid brand ID", nil)
	}
	existing.BrandID = uint(brID)
	varID, err := strconv.Atoi(body.VariantID)
	if err != nil {
		return dto.BadRequest(c, "Invalid variant ID", nil)
	}
	existing.VariantID = uint(varID)
	colID, err := strconv.Atoi(body.ColorID)
	if err != nil {
		return dto.BadRequest(c, "Invalid color ID", nil)
	}
	uColID := uint(colID)
	existing.ColorID = &uColID

	if body.MemoryID != "" {
		if mid, err := strconv.Atoi(body.MemoryID); err == nil {
			uMid := uint(mid)
			existing.MemoryID = &uMid
		}
	} else {
		existing.MemoryID = nil
	}

	existing.SKU = body.SKU
	existing.SkuIMEI = body.SkuIMEI
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update product item", nil)
	}

	return dto.OK(c, "Product item updated", fiber.Map{
		"item": existing.Map(),
	})
}

func ItemRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductItem{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete product item", nil)
	}

	return dto.OK(c, "Product item deleted", nil)
}

func ItemBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.
		Delete(&model.ProductItem{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete product items", nil)
	}

	return dto.OK(c, fmt.Sprintf("Success delete %d product items", len(body.IDs)), nil)
}
