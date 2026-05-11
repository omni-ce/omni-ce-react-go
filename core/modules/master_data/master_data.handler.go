package master_data

import (
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/master_data/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func GetPaginate(c *fiber.Ctx) error {
	items := make([]model.MasterData, 0)
	pagination, err := function.Pagination(c, &model.MasterData{}, nil, []string{"category", "key", "value"}, &items)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan data",
			En: "Failed to get data",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Data berhasil didapatkan",
		En: "Data retrieved successfully",
	}, fiber.Map{
		"rows":       items,
		"pagination": pagination.Meta(),
	})
}

func Create(c *fiber.Ctx) error {
	var body struct {
		Category string `json:"category" validate:"required"`
		Key      string `json:"key" validate:"required"`
		Value    string `json:"value" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Permintaan tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	// Check duplicate key within same category
	var existing model.MasterData
	if err := variable.Db.
		Where("category = ? AND key = ?", body.Category, body.Key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Key sudah ada di kategori ini",
			En: "Key already exists in this category",
		}, nil)
	}

	item := model.MasterData{
		Category: body.Category,
		Key:      body.Key,
		Value:    body.Value,
	}
	if err := variable.Db.
		Create(&item).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat data master",
			En: "Failed to create master data",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Data master berhasil dibuat",
		En: "Master data created successfully",
	}, item)
}

func Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid ID",
		}, nil)
	}

	var body struct {
		Category string `json:"category" validate:"required"`
		Key      string `json:"key" validate:"required"`
		Value    string `json:"value" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Permintaan tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	var item model.MasterData
	if err := variable.Db.
		First(&item, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Data master tidak ditemukan",
			En: "Master data not found",
		}, nil)
	}

	// Check duplicate key within same category (excluding self)
	var dup model.MasterData
	if err := variable.Db.
		Where("category = ? AND key = ? AND id != ?", body.Category, body.Key, id).
		First(&dup).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Key sudah ada di kategori ini",
			En: "Key already exists in this category",
		}, nil)
	}

	item.Category = body.Category
	item.Key = body.Key
	item.Value = body.Value
	if err := variable.Db.
		Save(&item).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui data master",
			En: "Failed to update master data",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Data master berhasil diperbarui",
		En: "Master data updated successfully",
	}, item)
}

func Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid ID",
		}, nil)
	}

	var item model.MasterData
	if err := variable.Db.
		First(&item, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Data master tidak ditemukan",
			En: "Master data not found",
		}, nil)
	}

	if err := variable.Db.
		Delete(&item).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus data master",
			En: "Failed to delete master data",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Data master berhasil dihapus",
		En: "Master data deleted successfully",
	}, nil)
}

func BulkDelete(c *fiber.Ctx) error {
	var body struct {
		IDs []uint64 `json:"ids" validate:"required,dive,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Permintaan tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	if len(body.IDs) == 0 {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid ID",
		}, nil)
	}

	if err := variable.Db.
		Delete(&model.MasterData{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus data master",
			En: "Failed to delete master data",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Data master berhasil dihapus",
		En: "Master data deleted successfully",
	}, fiber.Map{
		"deleted_count": len(body.IDs),
	})
}
