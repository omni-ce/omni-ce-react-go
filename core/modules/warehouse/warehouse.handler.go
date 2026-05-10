package warehouse

import (
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/warehouse/model"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ─── Location ────────────────────────────────────────────────────────────────

func LocationCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		BranchID  uint    `json:"branch_id" validate:"required"`
		PicID     uint    `json:"pic_id" validate:"required"`
		Name      string  `json:"name" validate:"required"`
		Longitude float64 `json:"longitude"`
		Latitude  float64 `json:"latitude"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	location := model.WarehouseLocation{
		BranchID:  body.BranchID,
		PicID:     body.PicID,
		Name:      strings.TrimSpace(body.Name),
		Longitude: body.Longitude,
		Latitude:  body.Latitude,
		IsActive:  true,
		CreatedBy: currentUser.ID,
		UpdatedBy: currentUser.ID,
	}

	if err := variable.Db.Create(&location).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create location", nil)
	}

	return dto.Created(c, "Location created", fiber.Map{
		"location": location.Map(),
	})
}

func LocationPaginate(c *fiber.Ctx) error {
	locations := make([]model.WarehouseLocation, 0)
	pagination, err := function.Pagination(c, &model.WarehouseLocation{}, func(query *gorm.DB) *gorm.DB {
		return query.Preload("Branch").Preload("Pic")
	}, []string{"name"}, &locations)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	result := make([]map[string]any, 0, len(locations))
	for i := range locations {
		loc := locations[i].Map()
		loc["branch_name"] = locations[i].Branch.Name
		loc["pic_name"] = locations[i].Pic.Name
		loc["map"] = map[string]any{
			"latitude":  locations[i].Latitude,
			"longitude": locations[i].Longitude,
		}
		result = append(result, loc)
	}

	return dto.OK(c, "Success get locations", fiber.Map{
		"rows":       result,
		"pagination": pagination.Meta(),
	})
}

func LocationEdit(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		BranchID  uint    `json:"branch_id"`
		PicID     uint    `json:"pic_id"`
		Name      string  `json:"name"`
		Longitude float64 `json:"longitude"`
		Latitude  float64 `json:"latitude"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.WarehouseLocation
	if err := variable.Db.First(&existing, id).Error; err != nil {
		return dto.NotFound(c, "Location not found", nil)
	}

	updates := map[string]any{
		"updated_by": currentUser.ID,
	}

	if body.BranchID != 0 {
		updates["branch_id"] = body.BranchID
	}
	if body.PicID != 0 {
		updates["pic_id"] = body.PicID
	}
	name := strings.TrimSpace(body.Name)
	if name != "" {
		updates["name"] = name
	}
	if body.Longitude != 0 {
		updates["longitude"] = body.Longitude
	}
	if body.Latitude != 0 {
		updates["latitude"] = body.Latitude
	}

	if err := variable.Db.Model(&existing).Updates(updates).Error; err != nil {
		return dto.InternalServerError(c, "Failed to update location", nil)
	}

	return dto.OK(c, "Success update location", fiber.Map{
		"location": existing.Map(),
	})
}

func LocationRemove(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	if err := variable.Db.Delete(&model.WarehouseLocation{}, id).Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete location", nil)
	}

	return dto.OK(c, "Success delete location", nil)
}

func LocationBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.Delete(&model.WarehouseLocation{}, "id IN ?", body.IDs).Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete locations", nil)
	}

	return dto.OK(c, "Success bulk delete locations", fiber.Map{
		"deleted_count": len(body.IDs),
	})
}

func LocationSetActive(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	var existing model.WarehouseLocation
	if err := variable.Db.First(&existing, id).Error; err != nil {
		return dto.NotFound(c, "Location not found", nil)
	}

	newStatus := !existing.IsActive
	if err := variable.Db.Model(&existing).Update("is_active", newStatus).Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle location status", nil)
	}

	return dto.OK(c, "Success toggle location status", fiber.Map{
		"location": existing.Map(),
	})
}

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
	products := make([]model.WarehouseProduct, 0)
	pagination, err := function.Pagination(c, &model.WarehouseProduct{}, func(query *gorm.DB) *gorm.DB {
		return query.Preload("WarehouseLocation").Preload("Product")
	}, []string{}, &products)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	result := make([]map[string]any, 0, len(products))
	for i := range products {
		p := products[i].Map()
		p["warehouse_location_name"] = products[i].WarehouseLocation.Name
		p["product_name"] = products[i].Product.Name
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
