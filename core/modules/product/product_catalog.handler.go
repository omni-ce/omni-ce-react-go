package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/modules/product/model"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func CatalogInfiniteScroll(c *fiber.Ctx) error {
	// 1. Get Categories & Types (Selective columns to avoid "all columns" issue)
	categories := make([]fiber.Map, 0)
	if err := variable.Db.
		Model(&model.ProductCategory{}).
		Select("id, key, name, icon").
		Where("is_active = ?", true).
		Find(&categories).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to get categories", nil)
	}

	types := make([]fiber.Map, 0)
	categoryID := c.Query("category_id")
	if categoryID != "" {
		if err := variable.Db.
			Model(&model.ProductType{}).
			Select("id, key, name").
			Where("category_id = ? AND is_active = ?", categoryID, true).
			Find(&types).
			Error; err != nil {
			return dto.InternalServerError(c, "Failed to get types", nil)
		}
	}

	// 2. Main Product Query with Selective Columns
	db := variable.Db.Model(&model.ProductItem{}).
		Select("id, sku, price, qty, category_id, type_id, brand_id, varian_id, memory_id, color_id").
		Preload("Category").
		Preload("Type").
		Preload("Brand").
		Preload("Variant").
		Preload("Memory").
		Preload("Color").
		Where("is_active = ?", true)

	// Filter conditions
	if categoryID != "" {
		db = db.Where("category_id = ?", categoryID)
	}
	if typeID := c.Query("type_id"); typeID != "" {
		db = db.Where("type_id = ?", typeID)
	}
	if search := c.Query("search"); search != "" {
		db = db.Where("sku LIKE ?", "%"+search+"%")
	}

	// Pagination parameters
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))

	var items []model.ProductItem
	if err := db.Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		return dto.InternalServerError(c, "Failed to get catalog items", nil)
	}

	// 3. Map Result (Explicitly select fields for response)
	rows := make([]fiber.Map, 0, len(items))
	for _, row := range items {
		item := fiber.Map{
			"id":            row.ID,
			"sku":           row.SKU,
			"price":         row.Price,
			"qty":           row.Qty,
			"category_id":   row.CategoryID,
			"type_id":       row.TypeID,
			"category_name": row.Category.Name,
			"type_name":     row.Type.Name,
			"brand_name":    row.Brand.Name,
			"brand_logo":    row.Brand.Logo,
			"varian_name":   row.Variant.Name,
			"color_name":    row.Color.Name,
			"color_hex":     row.Color.HexCode,
		}
		if row.MemoryID != nil {
			item["memory_name"] = fmt.Sprintf("%d GB / %d GB", row.Memory.Ram, row.Memory.InternalStorage)
		}
		rows = append(rows, item)
	}

	return dto.OK(c, "Success get catalog", fiber.Map{
		"categories": categories,
		"types":      types,
		"rows":       rows,
	})
}
