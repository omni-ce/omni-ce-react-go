package warehouse

import (
	"react-go/core/dto"
	"react-go/core/function"
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
		WarehouseLocationID uint `json:"warehouse_location_id" validate:"required"`
		ProductID           uint `json:"product_id" validate:"required"`
		Qty                 int  `json:"qty"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	product := model.WarehouseProduct{
		WarehouseLocationID: body.WarehouseLocationID,
		ProductID:           body.ProductID,
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

	result := make([]map[string]any, 0, len(products))
	for i := range products {
		p := products[i].Map()
		warehouse_location := warehouseLocations[warehouseLocationIds[i]]
		product := products[productIds[i]]
		p["warehouse_location_name"] = warehouse_location.Name
		p["product_name"] = product.Name
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
		WarehouseLocationID uint `json:"warehouse_location_id"`
		ProductID           uint `json:"product_id"`
		Qty                 int  `json:"qty"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.WarehouseProduct
	if err := variable.Db.First(&existing, id).Error; err != nil {
		return dto.NotFound(c, "Warehouse product not found", nil)
	}

	updates := map[string]any{
		"updated_by": currentUser.ID,
	}

	if body.WarehouseLocationID != 0 {
		updates["warehouse_location_id"] = body.WarehouseLocationID
	}
	if body.ProductID != 0 {
		updates["product_id"] = body.ProductID
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
