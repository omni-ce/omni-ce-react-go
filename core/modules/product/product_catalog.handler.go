package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/types"
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
		return dto.BadRequest(c, types.Language{
			Id: "Kesalahan pada body request",
			En: "Error on body request",
		}, fiber.Map{
			"error": err.Error(),
		})
	}

	// 1. Get Categories (Fetch into struct to avoid panic, then map to clean response)
	categoriesData := make([]model.ProductCategory, 0)
	if err := variable.Db.
		Select("id, key, name, icon").
		Where("is_active = ?", true).
		Find(&categoriesData).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengambil kategori",
			En: "Failed to get categories",
		}, nil)
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
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mengambil tipe",
				En: "Failed to get types",
			}, nil)
		}
	}
	_types := make([]fiber.Map, 0, len(typesData))
	for _, t := range typesData {
		_types = append(_types, fiber.Map{
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
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mengambil brand ids",
				En: "Failed to get brand ids",
			}, nil)
		}
		if err := variable.Db.
			Select("id, key, name, logo").
			Where("id IN ? AND is_active = ?", brandIds, true).
			Find(&brandsData).
			Error; err != nil {
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mengambil brand",
				En: "Failed to get brands",
			}, nil)
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
	itemDb := variable.Db.Table("product_items").Where("product_items.is_active = ?", true)
	if body.CategoryID != 0 {
		itemDb = itemDb.Where("product_items.category_id = ?", body.CategoryID)
	}
	if body.TypeID != 0 {
		itemDb = itemDb.Where("product_items.type_id = ?", body.TypeID)
	}
	if body.BrandID != 0 {
		itemDb = itemDb.Where("product_items.brand_id = ?", body.BrandID)
	}
	if body.Search != "" {
		itemDb = itemDb.Joins("LEFT JOIN product_variants ON product_variants.id = product_items.variant_id").
			Where("product_variants.name LIKE ?", "%"+body.Search+"%")
	}
	if len(body.IDs) > 0 {
		itemDb = itemDb.Where("product_items.variant_id NOT IN ?", body.IDs)
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
	if err := itemDb.Select("DISTINCT product_items.variant_id").
		Limit(body.Limit).Offset(offset).
		Pluck("variant_id", &variantIDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan variant ids",
			En: "Failed to get variant ids",
		}, nil)
	}

	if len(variantIDs) == 0 {
		return dto.OK(c, types.Language{
			Id: "Berhasil mendapatkan katalog",
			En: "Success get catalog",
		}, fiber.Map{
			"categories": categories,
			"types":      _types,
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan varian",
			En: "Failed to get variants",
		}, nil)
	}

	items := make([]model.ProductItem, 0)
	if err := variable.Db.
		Where("variant_id IN ?", variantIDs).
		Where("is_active = ?", true).
		Preload("Category").Preload("Type").Preload("Brand").
		Preload("Color").Preload("Memory").
		Find(&items).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan items",
			En: "Failed to get items",
		}, nil)
	}

	// Group items by VariantID
	itemsByVariant := make(map[uint][]model.ProductItem)
	for _, it := range items {
		itemsByVariant[it.VariantID] = append(itemsByVariant[it.VariantID], it)
	}

	// 6. Map Result (Variant-centric with Items array)
	rows := make([]fiber.Map, 0, len(variants))
	for _, v := range variants {
		vItems, ok := itemsByVariant[v.ID]
		if !ok || len(vItems) == 0 {
			continue
		}

		itemsList := make([]fiber.Map, 0, len(vItems))
		for _, it := range vItems {
			memoryName := ""
			if it.MemoryID != nil {
				memoryName = fmt.Sprintf("%d GB / %d GB", it.Memory.Ram, it.Memory.InternalStorage)
			}
			colorName := ""
			colorHex := ""
			if it.ColorID != nil {
				colorName = it.Color.Name
				colorHex = it.Color.HexCode
			}

			itemsList = append(itemsList, fiber.Map{
				"id":          it.ID,
				"sku":         it.SKU,
				"color_hex":   colorHex,
				"color_name":  colorName,
				"memory_name": memoryName,
				"price":       0,
				"qty":         0,
			})
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
			"items":         itemsList,
		})
	}

	return dto.OK(c, types.Language{
		Id: "Berhasil mendapatkan katalog",
		En: "Success get catalog",
	}, fiber.Map{
		"categories": categories,
		"types":      _types,
		"brands":     brands,
		"rows":       rows,
	})
}
