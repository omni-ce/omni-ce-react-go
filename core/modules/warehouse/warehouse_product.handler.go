package warehouse

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	company "react-go/core/modules/company/model"
	product "react-go/core/modules/product/model"
	model "react-go/core/modules/warehouse/model"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ─── Product ─────────────────────────────────────────────────────────────────

func ProductCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		WarehouseLocationID string `json:"warehouse_location_id" validate:"required"`
		ProductID           string `json:"product_id" validate:"required"`
		Qty                 int    `json:"qty"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	warehouseLocationId, err := strconv.Atoi(body.WarehouseLocationID)
	if err != nil {
		return dto.BadRequest(c, "Invalid warehouse location ID", nil)
	}
	productId, err := strconv.Atoi(body.ProductID)
	if err != nil {
		return dto.BadRequest(c, "Invalid product ID", nil)
	}

	product := model.WarehouseProduct{
		WarehouseLocationID: uint(warehouseLocationId),
		ProductID:           uint(productId),
		Qty:                 body.Qty,
		IsActive:            true,
		CreatedBy:           currentUser.ID,
		UpdatedBy:           currentUser.ID,
	}

	if err := variable.Db.Create(&product).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create warehouse product", nil)
	}

	return dto.Created(c, "Warehouse product created", fiber.Map{
		"product": product.Map(),
	})
}

func ProductPaginate(c *fiber.Ctx) error {
	warehouseProducts := make([]model.WarehouseProduct, 0)
	pagination, err := function.Pagination(c, &model.WarehouseProduct{}, func(query *gorm.DB) *gorm.DB {
		return query.Preload("WarehouseLocation").Preload("Product")
	}, []string{}, &warehouseProducts)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	warehouseLocationIds := make([]uint, 0, len(warehouseProducts))
	for _, product := range warehouseProducts {
		warehouseLocationIds = append(warehouseLocationIds, product.WarehouseLocationID)
	}

	productIds := make([]uint, 0, len(warehouseProducts))
	for _, product := range warehouseProducts {
		productIds = append(productIds, product.ProductID)
	}

	warehouseLocations := make([]model.WarehouseLocation, 0)
	products := make([]product.ProductItem, 0)
	variable.Db.Where("id IN ?", warehouseLocationIds).Find(&warehouseLocations)
	variable.Db.Where("id IN ?", productIds).Find(&products)

	branchIds := make([]uint, 0)
	for _, row := range warehouseLocations {
		branchIds = append(branchIds, row.BranchID)
	}

	branches := make([]company.CompanyBranch, 0)
	if err := variable.Db.
		Model(&company.CompanyBranch{}).
		Where("id IN (?)", branchIds).
		Find(&branches).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find company branches", nil)
	}
	entityIds := make([]uint, 0)
	for _, row := range branches {
		entityIds = append(entityIds, row.EntityID)
	}

	entities := make([]company.CompanyEntity, 0)
	if err := variable.Db.
		Model(&company.CompanyEntity{}).
		Where("id IN (?)", entityIds).
		Find(&entities).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find company entities", nil)
	}

	productCategoryIds := make([]uint, 0, len(products))
	for _, product := range products {
		productCategoryIds = append(productCategoryIds, product.CategoryID)
	}
	productTypeIds := make([]uint, 0, len(products))
	for _, product := range products {
		productTypeIds = append(productTypeIds, product.TypeID)
	}
	productBrandIds := make([]uint, 0, len(products))
	for _, product := range products {
		productBrandIds = append(productBrandIds, product.BrandID)
	}
	productVariantIds := make([]uint, 0, len(products))
	for _, product := range products {
		productVariantIds = append(productVariantIds, product.VariantID)
	}
	productMemoryIds := make([]uint, 0, len(products))
	for _, product := range products {
		if product.MemoryID != nil {
			productMemoryIds = append(productMemoryIds, *product.MemoryID)
		}
	}
	productColorIds := make([]uint, 0, len(products))
	for _, product := range products {
		if product.ColorID != nil {
			productColorIds = append(productColorIds, *product.ColorID)
		}
	}

	productCategories := make([]product.ProductCategory, 0)
	variable.Db.Where("id IN ?", productCategoryIds).Find(&productCategories)
	productTypes := make([]product.ProductType, 0)
	variable.Db.Where("id IN ?", productTypeIds).Find(&productTypes)
	productBrands := make([]product.ProductBrand, 0)
	variable.Db.Where("id IN ?", productBrandIds).Find(&productBrands)
	productVariants := make([]product.ProductVariant, 0)
	variable.Db.Where("id IN ?", productVariantIds).Find(&productVariants)
	productMemories := make([]product.ProductMemory, 0)
	variable.Db.Where("id IN ?", productMemoryIds).Find(&productMemories)
	productColors := make([]product.ProductColor, 0)
	variable.Db.Where("id IN ?", productColorIds).Find(&productColors)

	result := make([]map[string]any, 0, len(warehouseProducts))
	for i := range warehouseProducts {
		p := warehouseProducts[i].Map()
		var warehouse_location model.WarehouseLocation
		for _, wl := range warehouseLocations {
			if wl.ID == warehouseProducts[i].WarehouseLocationID {
				warehouse_location = wl
				break
			}
		}
		var product_item product.ProductItem
		for _, pr := range products {
			if pr.ID == warehouseProducts[i].ProductID {
				product_item = pr
				break
			}
		}
		var product_category product.ProductCategory
		for _, pc := range productCategories {
			if pc.ID == product_item.CategoryID {
				product_category = pc
				break
			}
		}
		var product_type product.ProductType
		for _, pt := range productTypes {
			if pt.ID == product_item.TypeID {
				product_type = pt
				break
			}
		}
		var product_brand product.ProductBrand
		for _, pb := range productBrands {
			if pb.ID == product_item.BrandID {
				product_brand = pb
				break
			}
		}
		var product_variant product.ProductVariant
		for _, pv := range productVariants {
			if pv.ID == product_item.VariantID {
				product_variant = pv
				break
			}
		}
		var product_memory product.ProductMemory
		for _, pm := range productMemories {
			if pm.ID == *product_item.MemoryID {
				product_memory = pm
				break
			}
		}
		var product_color product.ProductColor
		for _, pc := range productColors {
			if pc.ID == *product_item.ColorID {
				product_color = pc
				break
			}
		}

		var branch company.CompanyBranch
		for _, b := range branches {
			if b.ID == warehouse_location.BranchID {
				branch = b
				break
			}
		}
		var entity company.CompanyEntity
		for _, e := range entities {
			if e.ID == branch.EntityID {
				entity = e
				break
			}
		}

		p["entity_name"] = entity.Name
		p["branch_name"] = branch.Name
		p["warehouse_location_name"] = warehouse_location.Name
		p["product_sku"] = product_item.SKU
		product_name := fmt.Sprintf("%s %s", product_brand.Name, product_variant.Name)
		if product_memory.ID != 0 {
			product_name += fmt.Sprintf(" (%d GB / %d GB)", product_memory.Ram, product_memory.InternalStorage)
		}
		if product_color.ID != 0 {
			product_name += fmt.Sprintf(" - %s", product_color.Name)
		}
		p["product_name"] = product_name
		p["product_category_name"] = product_category.Name
		p["product_type_name"] = product_type.Name
		result = append(result, p)
	}

	return dto.OK(c, "Success get warehouse products", fiber.Map{
		"rows":       result,
		"pagination": pagination.Meta(),
	})
}

func ProductEdit(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		WarehouseLocationID string `json:"warehouse_location_id"`
		ProductID           string `json:"product_id"`
		Qty                 int    `json:"qty"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	warehouseLocationId, err := strconv.Atoi(body.WarehouseLocationID)
	if err != nil {
		return dto.BadRequest(c, "Invalid warehouse location ID", nil)
	}
	productId, err := strconv.Atoi(body.ProductID)
	if err != nil {
		return dto.BadRequest(c, "Invalid product ID", nil)
	}

	var existing model.WarehouseProduct
	if err := variable.Db.First(&existing, id).Error; err != nil {
		return dto.NotFound(c, "Warehouse product not found", nil)
	}

	updates := map[string]any{
		"updated_by": currentUser.ID,
	}

	if body.WarehouseLocationID != "" {
		updates["warehouse_location_id"] = uint(warehouseLocationId)
	}
	if body.ProductID != "" {
		updates["product_id"] = uint(productId)
	}
	updates["qty"] = body.Qty

	if err := variable.Db.Model(&existing).Updates(updates).Error; err != nil {
		return dto.InternalServerError(c, "Failed to update warehouse product", nil)
	}

	return dto.OK(c, "Success update warehouse product", fiber.Map{
		"product": existing.Map(),
	})
}

func ProductRemove(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	if err := variable.Db.Delete(&model.WarehouseProduct{}, id).Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete warehouse product", nil)
	}

	return dto.OK(c, "Success delete warehouse product", nil)
}

func ProductBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.Delete(&model.WarehouseProduct{}, "id IN ?", body.IDs).Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete warehouse products", nil)
	}

	return dto.OK(c, "Success bulk delete warehouse products", fiber.Map{
		"deleted_count": len(body.IDs),
	})
}

func ProductSetActive(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	var existing model.WarehouseProduct
	if err := variable.Db.First(&existing, id).Error; err != nil {
		return dto.NotFound(c, "Warehouse product not found", nil)
	}

	newStatus := !existing.IsActive
	if err := variable.Db.Model(&existing).Update("is_active", newStatus).Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle warehouse product status", nil)
	}

	return dto.OK(c, "Success toggle warehouse product status", fiber.Map{
		"product": existing.Map(),
	})
}
