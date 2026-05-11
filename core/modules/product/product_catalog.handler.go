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
		Find(&categoriesData).
		Error; err != nil {
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
			Find(&typesData).
			Error; err != nil {
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
		brandIds := make([]uint, 0)
		if err := variable.Db.
			Model(&model.ProductItem{}).
			Where("type_id = ? AND is_active = ?", body.TypeID, true).
			Distinct("brand_id").
			Pluck("brand_id", &brandIds).
			Error; err != nil {
			return dto.InternalServerError(c, "Failed to get brand IDs", nil)
		}
		if err := variable.Db.
			Select("id, key, name, logo").
			Where("id IN ? AND is_active = ?", brandIds, true).
			Find(&brandsData).
			Error; err != nil {
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

	// 4. Get filtered Variant IDs from ProductItem
	itemDb := variable.Db.Model(&model.ProductItem{}).Where("is_active = ?", true)
	if body.CategoryID != 0 {
		itemDb = itemDb.Where("category_id = ?", body.CategoryID)
	}
	if body.TypeID != 0 {
		itemDb = itemDb.Where("type_id = ?", body.TypeID)
	}
	if body.BrandID != 0 {
		itemDb = itemDb.Where("brand_id = ?", body.BrandID)
	}
	if body.Search != "" {
		itemDb = itemDb.Joins("Variant").Where("`Variant`.name LIKE ?", "%"+body.Search+"%")
	}
	if len(body.IDs) > 0 {
		itemDb = itemDb.Where("variant_id NOT IN ?", body.IDs)
	}

	// Pagination on Variants
	if body.Page <= 0 {
		body.Page = 1
	}
	if body.Limit <= 0 {
		body.Limit = 20
	}
	offset := (body.Page - 1) * body.Limit

	variantIDs := make([]uint, 0)
	if err := itemDb.Distinct("variant_id").
		Limit(body.Limit).Offset(offset).
		Pluck("variant_id", &variantIDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to get variant IDs", nil)
	}

	if len(variantIDs) == 0 {
		return dto.OK(c, "Success get catalog", fiber.Map{
			"categories": categories,
			"types":      types,
			"brands":     brands,
			"rows":       []any{},
		})
	}

	// 5. Fetch Variant details and their Items
	variants := make([]model.ProductVariant, 0)
	if err := variable.Db.
		Where("id IN ?", variantIDs).
		Find(&variants).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to get variants", nil)
	}

	items := make([]model.ProductItem, 0)
	if err := variable.Db.
		Where("variant_id IN ?", variantIDs).
		Where("is_active = ?", true).
		Preload("Category").Preload("Type").Preload("Brand").
		Preload("Color").Preload("Memory").
		Find(&items).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to get items", nil)
	}

	// Group items by VariantID
	itemsByVariant := make(map[uint][]model.ProductItem)
	for _, it := range items {
		itemsByVariant[it.VariantID] = append(itemsByVariant[it.VariantID], it)
	}

	// 6. Map Result (Variant-centric with Color/Memory arrays)
	rows := make([]fiber.Map, 0, len(variants))
	for _, v := range variants {
		vItems, ok := itemsByVariant[v.ID]
		if !ok || len(vItems) == 0 {
			continue
		}

		// Aggregate item data
		colorsMap := make(map[uint]fiber.Map)
		memoriesMap := make(map[uint]fiber.Map)
		var minPrice float64 = -1
		var totalQty float64 = 0

		for _, it := range vItems {
			totalQty += it.Qty
			if minPrice == -1 || it.Price < minPrice {
				minPrice = it.Price
			}

			if it.ColorID != nil {
				colorsMap[*it.ColorID] = fiber.Map{
					"id":   it.Color.ID,
					"name": it.Color.Name,
					"hex":  it.Color.HexCode,
				}
			}
			if it.MemoryID != nil {
				memoriesMap[*it.MemoryID] = fiber.Map{
					"id":   it.Memory.ID,
					"name": fmt.Sprintf("%d GB / %d GB", it.Memory.Ram, it.Memory.InternalStorage),
				}
			}
		}

		// Flatten maps to slices
		colors := make([]fiber.Map, 0, len(colorsMap))
		for _, c := range colorsMap {
			colors = append(colors, c)
		}
		memories := make([]fiber.Map, 0, len(memoriesMap))
		for _, m := range memoriesMap {
			memories = append(memories, m)
		}

		// Pick representative data from first item
		first := vItems[0]
		rows = append(rows, fiber.Map{
			"id":            v.ID,
			"varian_name":   v.Name,
			"brand_name":    first.Brand.Name,
			"brand_logo":    first.Brand.Logo,
			"type_name":     first.Type.Name,
			"category_name": first.Category.Name,
			"sku":           first.SKU, // Representative SKU
			"price":         minPrice,  // Starting price
			"qty":           totalQty,  // Total variant qty
			"colors":        colors,
			"memories":      memories,
		})
	}

	return dto.OK(c, "Success get catalog", fiber.Map{
		"categories": categories,
		"types":      types,
		"brands":     brands,
		"rows":       rows,
	})
}
