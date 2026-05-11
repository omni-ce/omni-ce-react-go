package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
)

func CatalogInfiniteScroll(c *fiber.Ctx) error {
	var body struct {
		CategoryID int    `json:"category_id"`
		TypeID     int    `json:"type_id"`
		BrandID    int    `json:"brand_id"`
		Search     string `json:"search"`
		Page       int    `json:"page"`  // default: 1
		Limit      int    `json:"limit"` // default: 20
		IDs        []int  `json:"ids"`   // not in ids
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// 1. Get Categories (Fetch into struct to avoid panic, then map to clean response)
	categoriesData := make([]model.ProductCategory, 0)
	if err := variable.Db.
		Select("id, key, name, icon").
		Where("is_active = ?", true).
		Find(&categoriesData).Error; err != nil {
		return dto.InternalServerError(c, "Failed to get categories", nil)
	}
	categories := make([]fiber.Map, 0, len(categoriesData))
	for _, cat := range categoriesData {
		categories = append(categories, fiber.Map{
			"id":   cat.ID,
			"key":  cat.Key,
			"name": cat.Name,
			"icon": cat.Icon,
		})
	}

	// 2. Get Types
	typesData := make([]model.ProductType, 0)
	if body.CategoryID != 0 {
		if err := variable.Db.
			Select("id, key, name").
			Where("category_id = ? AND is_active = ?", body.CategoryID, true).
			Find(&typesData).Error; err != nil {
			return dto.InternalServerError(c, "Failed to get types", nil)
		}
	}
	types := make([]fiber.Map, 0, len(typesData))
	for _, t := range typesData {
		types = append(types, fiber.Map{
			"id":   t.ID,
			"key":  t.Key,
			"name": t.Name,
		})
	}

	// 3. Get Brand
	brandsData := make([]model.ProductBrand, 0)
	if body.TypeID != 0 {
		if err := variable.Db.
			Select("id, key, name, logo").
			Where("type_id = ? AND is_active = ?", body.TypeID, true).
			Find(&brandsData).Error; err != nil {
			return dto.InternalServerError(c, "Failed to get brands", nil)
		}
	}
	brands := make([]fiber.Map, 0, len(brandsData))
	for _, b := range brandsData {
		brands = append(brands, fiber.Map{
			"id":   b.ID,
			"key":  b.Key,
			"name": b.Name,
			"logo": b.Logo,
		})
	}

	// 4. Main Product Query
	db := variable.Db.Model(&model.ProductItem{}).
		Select("id, category_id, type_id, brand_id, variant_id, memory_id, color_id, sku, sku_imei, price, qty").
		Preload("Category").
		Preload("Type").
		Preload("Brand").
		Preload("Variant").
		Preload("Memory").
		Preload("Color").
		Where("is_active = ?", true)

	// Filter conditions
	if body.CategoryID != 0 {
		db = db.Where("category_id = ?", body.CategoryID)
	}
	if body.TypeID != 0 {
		db = db.Where("type_id = ?", body.TypeID)
	}
	if body.BrandID != 0 {
		db = db.Where("brand_id = ?", body.BrandID)
	}
	if body.Search != "" {
		db = db.Where("sku LIKE ?", "%"+body.Search+"%")
	}
	if len(body.IDs) > 0 {
		db = db.Where("id NOT IN ?", body.IDs)
	}

	// Pagination parameters
	if body.Page <= 0 {
		body.Page = 1
	}
	if body.Limit <= 0 {
		body.Limit = 20
	}
	offset := (body.Page - 1) * body.Limit

	var items []model.ProductItem
	if err := db.Limit(body.Limit).Offset(offset).Find(&items).Error; err != nil {
		return dto.InternalServerError(c, "Failed to get catalog items", nil)
	}

	// 4. Map Result (Explicitly select fields for response)
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
		"brands":     brands,
		"rows":       rows,
	})
}
