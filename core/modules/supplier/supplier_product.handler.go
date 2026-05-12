package supplier

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	product_model "react-go/core/modules/product/model"
	"react-go/core/modules/supplier/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func ProductCreate(c *fiber.Ctx) error {
	var body struct {
		SupplierID string `json:"supplier_id" validate:"required"`
		ProductID  string `json:"product_id" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	supplierID, _ := strconv.Atoi(body.SupplierID)
	productID, _ := strconv.Atoi(body.ProductID)

	// Check if supplier exists
	var supplier model.SupplierEntity
	if err := variable.Db.First(&supplier, "id = ?", supplierID).Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Supplier tidak ditemukan",
			En: "Supplier not found",
		}, nil)
	}

	// Check if product exists
	var product product_model.ProductItem
	if err := variable.Db.First(&product, "id = ?", productID).Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Produk tidak ditemukan",
			En: "Product not found",
		}, nil)
	}

	// Check if already exists
	var existing model.SupplierProduct
	if err := variable.Db.Where("supplier_id = ? AND product_id = ?", supplierID, productID).First(&existing).Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Produk sudah terdaftar untuk supplier ini",
			En: "Product already registered for this supplier",
		}, nil)
	}

	row := model.SupplierProduct{
		SupplierID: uint(supplierID),
		ProductID:  uint(productID),
		IsActive:   true,
	}

	if err := variable.Db.Create(&row).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menambahkan produk supplier",
			En: "Failed to add supplier product",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Produk supplier berhasil ditambahkan",
		En: "Supplier product added successfully",
	}, fiber.Map{
		"row": row.Map(),
	})
}

func ProductPaginate(c *fiber.Ctx) error {
	col_supplier_name := c.Query("col_supplier_name")
	col_product_name := c.Query("col_product_name")

	items := make([]model.SupplierProduct, 0)
	query := variable.Db.Model(&model.SupplierProduct{}).
		Preload("Supplier").
		Preload("Product").
		Preload("Product.Category").
		Preload("Product.Type").
		Preload("Product.Brand").
		Preload("Product.Variant").
		Preload("Product.Memory").
		Preload("Product.Color").
		Preload("Product.Condition").
		Preload("Product.Unit")

	if col_supplier_name != "" {
		query = query.Joins("Supplier").Where("LOWER(Supplier.name) LIKE ?", "%"+strings.ToLower(col_supplier_name)+"%")
	}

	// For product name, we might need a more complex join if product name is derived
	// But let's assume it's just searching product SKU or similar for now if name is not a field
	if col_product_name != "" {
		query = query.Joins("Product").Where("LOWER(Product.sku) LIKE ?", "%"+strings.ToLower(col_product_name)+"%")
	}

	pagination, err := function.PaginationScoped(c, query, &model.SupplierProduct{}, []string{}, &items)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengambil data",
			En: "Failed to retrieve data",
		}, nil)
	}

	rows := make([]map[string]any, 0, len(items))
	for _, row := range items {
		memory_name := ""
		if row.Product.MemoryID != nil {
			memory_name = fmt.Sprintf("%d GB / %d GB", row.Product.Memory.Ram, row.Product.Memory.InternalStorage)
		}

		rows = append(rows, map[string]any{
			"id":               row.ID,
			"supplier_id":      row.SupplierID,
			"supplier_name":    row.Supplier.Name,
			"product_id":       row.ProductID,
			"product_sku":      row.Product.SKU,
			"product_name":     row.Product.Key, // Using Key as name fallback
			"product_brand":    row.Product.Brand.Name,
			"product_category": row.Product.Category.Name,
			"product_memory":   memory_name,
			"product_color":    row.Product.Color.Name,
			"is_active":        row.IsActive,
		})
	}

	return dto.OK(c, types.Language{
		Id: "Data berhasil diambil",
		En: "Data retrieved successfully",
	}, fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func ProductEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		SupplierID string `json:"supplier_id" validate:"required"`
		ProductID  string `json:"product_id" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	supplierID, _ := strconv.Atoi(body.SupplierID)
	productID, _ := strconv.Atoi(body.ProductID)

	var row model.SupplierProduct
	if err := variable.Db.First(&row, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Data tidak ditemukan",
			En: "Data not found",
		}, nil)
	}

	// Check if already exists for other records
	var dup model.SupplierProduct
	if err := variable.Db.Where("supplier_id = ? AND product_id = ? AND id != ?", supplierID, productID, id).First(&dup).Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Produk sudah terdaftar untuk supplier ini",
			En: "Product already registered for this supplier",
		}, nil)
	}

	row.SupplierID = uint(supplierID)
	row.ProductID = uint(productID)

	if err := variable.Db.Save(&row).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui produk supplier",
			En: "Failed to update supplier product",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Produk supplier berhasil diperbarui",
		En: "Supplier product updated successfully",
	}, fiber.Map{
		"row": row.Map(),
	})
}

func ProductRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.Delete(&model.SupplierProduct{}, "id = ?", id).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus data",
			En: "Failed to delete data",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Data berhasil dihapus",
		En: "Data deleted successfully",
	}, nil)
}

func ProductBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.Delete(&model.SupplierProduct{}, "id IN ?", body.IDs).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus data",
			En: "Failed to delete data",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: fmt.Sprintf("Berhasil menghapus %d data", len(body.IDs)),
		En: fmt.Sprintf("Successfully deleted %d data", len(body.IDs)),
	}, nil)
}

func ProductSetActive(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		IsActive bool `json:"is_active"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.Model(&model.SupplierProduct{}).Where("id = ?", id).Update("is_active", body.IsActive).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengubah status",
			En: "Failed to change status",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Status berhasil diubah",
		En: "Status changed successfully",
	}, nil)
}
