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
		CategoryID  string `json:"category_id" validate:"required"`
		TypeID      string `json:"type_id" validate:"required"`
		BrandID     string `json:"brand_id" validate:"required"`
		VariantID   string `json:"variant_id" validate:"required"`
		MemoryID    string `json:"memory_id"`
		ColorID     string `json:"color_id" validate:"required"`
		ConditionID string `json:"condition_id" validate:"required"`
		SKU         string `json:"sku" validate:"required"`
		SkuIMEI     string `json:"sku_imei"`
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
	conditionID, err := strconv.Atoi(body.ConditionID)
	if err != nil {
		return dto.BadRequest(c, "Invalid condition ID", nil)
	}

	names := make([]string, 0)

	var category model.ProductCategory
	if err := variable.Db.First(&category, "id = ?", body.CategoryID).Error; err != nil {
		return dto.NotFound(c, "Category not found", nil)
	}
	names = append(names, category.Name)
	var _type model.ProductType
	if err := variable.Db.First(&_type, "id = ?", body.TypeID).Error; err != nil {
		return dto.NotFound(c, "Type not found", nil)
	}
	names = append(names, _type.Name)
	var brand model.ProductBrand
	if err := variable.Db.First(&brand, "id = ?", body.BrandID).Error; err != nil {
		return dto.NotFound(c, "Brand not found", nil)
	}
	names = append(names, brand.Name)
	var variant model.ProductVariant
	if err := variable.Db.First(&variant, "id = ?", body.VariantID).Error; err != nil {
		return dto.NotFound(c, "Variant not found", nil)
	}
	names = append(names, variant.Name)
	var condition model.ProductCondition
	if err := variable.Db.First(&condition, "id = ?", body.ConditionID).Error; err != nil {
		return dto.NotFound(c, "Condition not found", nil)
	}
	names = append(names, condition.Name)

	var memoryID *uint
	if body.MemoryID != "" {
		if mid, err := strconv.Atoi(body.MemoryID); err == nil {
			uMid := uint(mid)
			memoryID = &uMid
			var memory model.ProductMemory
			if err := variable.Db.First(&memory, "id = ?", body.MemoryID).Error; err != nil {
				return dto.NotFound(c, "Memory not found", nil)
			}
			names = append(names, fmt.Sprintf("%d GB / %d GB", memory.Ram, memory.InternalStorage))
		}
	}
	var colorID *uint
	if body.ColorID != "" {
		if mid, err := strconv.Atoi(body.ColorID); err == nil {
			uMid := uint(mid)
			colorID = &uMid
			var color model.ProductColor
			if err := variable.Db.First(&color, "id = ?", body.ColorID).Error; err != nil {
				return dto.NotFound(c, "Color not found", nil)
			}
			names = append(names, color.Name)
		}
	}

	key := generateKeyFromName(names...)

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
		Key:         key,
		CategoryID:  uint(categoryID),
		TypeID:      uint(typeID),
		BrandID:     uint(brandID),
		VariantID:   uint(variantID),
		MemoryID:    memoryID,
		ColorID:     colorID,
		ConditionID: uint(conditionID),
		SKU:         body.SKU,
		SkuIMEI:     body.SkuIMEI,
		CreatedBy:   currentUser.ID,
		UpdatedBy:   currentUser.ID,
	}

	if err := variable.Db.
		Create(&item).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, "Product item already exists", nil)
		}
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
		&search_fields=sku,category_name,type_name,brand_name,variant_name
		&col_sku=a&col_category_name=b&col_type_name=c&col_brand_name=d&col_variant_name=e
	*/
	col_sku := c.Query("col_sku")
	col_category_name := c.Query("col_category_name")
	col_type_name := c.Query("col_type_name")
	col_brand_name := c.Query("col_brand_name")
	col_variant_name := c.Query("col_variant_name")

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
	if col_variant_name != "" {
		query = query.Joins("Variant").Where("LOWER(Variant.name) LIKE ?", "%"+strings.ToLower(col_variant_name)+"%")
	}

	// Gunakan PaginationScoped agar Count menyertakan filter Join & Where di atas
	pagination, err := function.PaginationScoped(c, query, &model.ProductItem{}, []string{}, &items)

	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	rows := make([]map[string]any, 0, len(items))
	for _, row := range items {
		memory_name := ""
		if row.MemoryID != nil {
			memory_name = fmt.Sprintf("%d GB / %d GB", row.Memory.Ram, row.Memory.InternalStorage)
		}
		rows = append(rows, map[string]any{
			"id":            row.ID,
			"sku":           row.SKU,
			"sku_imei":      row.SkuIMEI,
			"buy_price":     0,
			"qty":           0,
			"category_id":   row.Category.ID,
			"category_name": row.Category.Name,
			"category_icon": row.Category.Icon,
			"type_id":       row.Type.ID,
			"type_name":     row.Type.Name,
			"brand_id":      row.Brand.ID,
			"brand_name":    row.Brand.Name,
			"brand_logo":    row.Brand.Logo,
			"variant_id":    row.Variant.ID,
			"variant_name":  row.Variant.Name,
			"memory_id":     row.Memory.ID,
			"memory_name":   memory_name,
			"color_id":      row.Color.ID,
			"color_name":    row.Color.Name,
			"color_hex":     row.Color.HexCode,
			"is_active":     row.IsActive,
		})
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
		CategoryID  string `json:"category_id" validate:"required"`
		TypeID      string `json:"type_id" validate:"required"`
		BrandID     string `json:"brand_id" validate:"required"`
		VariantID   string `json:"variant_id" validate:"required"`
		MemoryID    string `json:"memory_id"`
		ColorID     string `json:"color_id" validate:"required"`
		ConditionID string `json:"condition_id" validate:"required"`
		BuyPrice    string `json:"buy_price" validate:"required"`
		SKU         string `json:"sku" validate:"required"`
		SkuIMEI     string `json:"sku_imei"`
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

	if body.MemoryID != "" {
		if mid, err := strconv.Atoi(body.MemoryID); err == nil {
			uMid := uint(mid)
			existing.MemoryID = &uMid
		}
	} else {
		existing.MemoryID = nil
	}
	if body.ColorID != "" {
		if mid, err := strconv.Atoi(body.ColorID); err == nil {
			uMid := uint(mid)
			existing.ColorID = &uMid
		}
	} else {
		existing.ColorID = nil
	}

	condID, err := strconv.Atoi(body.ConditionID)
	if err != nil {
		return dto.BadRequest(c, "Invalid condition ID", nil)
	}
	existing.ConditionID = uint(condID)

	existing.SKU = body.SKU
	existing.SkuIMEI = body.SkuIMEI
	existing.UpdatedBy = currentUser.ID

	// Regenerate Key
	keyNames := make([]string, 0)
	var cat model.ProductCategory
	if err := variable.Db.First(&cat, existing.CategoryID).Error; err == nil {
		keyNames = append(keyNames, cat.Name)
	}
	var typ model.ProductType
	if err := variable.Db.First(&typ, existing.TypeID).Error; err == nil {
		keyNames = append(keyNames, typ.Name)
	}
	var brnd model.ProductBrand
	if err := variable.Db.First(&brnd, existing.BrandID).Error; err == nil {
		keyNames = append(keyNames, brnd.Name)
	}
	var vrnt model.ProductVariant
	if err := variable.Db.First(&vrnt, existing.VariantID).Error; err == nil {
		keyNames = append(keyNames, vrnt.Name)
	}
	if existing.MemoryID != nil {
		var mem model.ProductMemory
		if err := variable.Db.First(&mem, *existing.MemoryID).Error; err == nil {
			keyNames = append(keyNames, fmt.Sprintf("%d GB / %d GB", mem.Ram, mem.InternalStorage))
		}
	}
	if existing.ColorID != nil {
		var clr model.ProductColor
		if err := variable.Db.First(&clr, *existing.ColorID).Error; err == nil {
			keyNames = append(keyNames, clr.Name)
		}
	}
	var con model.ProductCondition
	if err := variable.Db.First(&con, existing.ConditionID).Error; err == nil {
		keyNames = append(keyNames, con.Name)
	}
	existing.Key = generateKeyFromName(keyNames...)

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
