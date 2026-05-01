package master_data

import (
	"react-go/dto"
	"react-go/function"
	model "react-go/modules/master_data/model"
	"react-go/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func GetPaginate(c *fiber.Ctx) error {
	items := make([]model.MasterData, 0)
	pagination, err := function.Pagination(c, &model.MasterData{}, nil, []string{"category", "key", "value"}, &items)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	return dto.OK(c, "Success", fiber.Map{
		"rows":       items,
		"pagination": pagination.Meta(),
	})
}

func Create(c *fiber.Ctx) error {
	var req struct {
		Category string `json:"category" validate:"required"`
		Key      string `json:"key" validate:"required"`
		Value    string `json:"value"`
	}
	if err := function.RequestBody(c, &req); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// Check duplicate key within same category
	var existing model.MasterData
	if err := variable.Db.Where("category = ? AND key = ?", req.Category, req.Key).First(&existing).Error; err == nil {
		return dto.BadRequest(c, "Key already exists in this category", nil)
	}

	item := model.MasterData{
		Category: req.Category,
		Key:      req.Key,
		Value:    req.Value,
	}
	if err := variable.Db.Create(&item).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create master data", nil)
	}

	return dto.Created(c, "Master data created", item)
}

func Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	var req struct {
		Category string `json:"category" validate:"required"`
		Key      string `json:"key" validate:"required"`
		Value    string `json:"value"`
	}
	if err := function.RequestBody(c, &req); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var item model.MasterData
	if err := variable.Db.First(&item, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, "Master data not found", nil)
	}

	// Check duplicate key within same category (excluding self)
	var dup model.MasterData
	if err := variable.Db.Where("category = ? AND key = ? AND id != ?", req.Category, req.Key, id).First(&dup).Error; err == nil {
		return dto.BadRequest(c, "Key already exists in this category", nil)
	}

	item.Category = req.Category
	item.Key = req.Key
	item.Value = req.Value
	if err := variable.Db.Save(&item).Error; err != nil {
		return dto.InternalServerError(c, "Failed to update master data", nil)
	}

	return dto.OK(c, "Master data updated", item)
}

func Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	var item model.MasterData
	if err := variable.Db.First(&item, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, "Master data not found", nil)
	}

	if err := variable.Db.Delete(&item).Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete master data", nil)
	}

	return dto.OK(c, "Master data deleted", nil)
}

func BulkDelete(c *fiber.Ctx) error {
	var req struct {
		IDs []uint64 `json:"ids"`
	}
	if err := c.BodyParser(&req); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	if len(req.IDs) == 0 {
		return dto.BadRequest(c, "No IDs provided", nil)
	}

	if err := variable.Db.
		Delete(&model.MasterData{}, "id IN ?", req.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete master data", nil)
	}

	return dto.OK(c, "Success bulk delete master data", fiber.Map{
		"deleted_count": len(req.IDs),
	})
}
