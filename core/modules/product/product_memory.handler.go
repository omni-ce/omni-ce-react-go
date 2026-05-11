package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func MemoryCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Ram             string `json:"ram" validate:"required"`
		InternalStorage string `json:"internal_storage" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	ramInt, err := strconv.Atoi(body.Ram)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "RAM harus berupa angka",
			En: "RAM must be an integer",
		}, nil)
	}
	internalStorageInt, err := strconv.Atoi(body.InternalStorage)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Internal Storage harus berupa angka",
			En: "Internal Storage must be an integer",
		}, nil)
	}

	key := generateKeyFromName(body.Ram, body.InternalStorage)

	// Check duplicate key
	var existing model.ProductMemory
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Memory dengan nama ini sudah ada",
			En: "Memory with this name already exists",
		}, nil)
	}

	memory := model.ProductMemory{
		Key:             key,
		Ram:             ramInt,
		InternalStorage: internalStorageInt,
		CreatedBy:       currentUser.ID,
		UpdatedBy:       currentUser.ID,
	}

	if err := variable.Db.
		Create(&memory).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Memory dengan nama ini sudah ada",
				En: "Memory with this name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat memory",
			En: "Failed to create memory",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Memory berhasil dibuat",
		En: "Memory created successfully",
	}, fiber.Map{
		"memory": memory.Map(),
	})
}

func MemoryPaginate(c *fiber.Ctx) error {
	var memories []model.ProductMemory
	pagination, err := function.Pagination(c, &model.ProductMemory{}, nil, []string{"name", "key"}, &memories)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mempersiapkan pagination",
			En: "Failed to prepare pagination",
		}, nil)
	}

	rows := make([]map[string]any, 0, len(memories))
	for _, cat := range memories {
		rows = append(rows, cat.Map())
	}

	return dto.OK(c, types.Language{
		Id: "Berhasil mendapatkan memory",
		En: "Success get memories",
	}, fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func MemoryEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Ram             string `json:"ram" validate:"required"`
		InternalStorage string `json:"internal_storage" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	ramInt, err := strconv.Atoi(body.Ram)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "RAM harus berupa angka",
			En: "RAM must be an integer",
		}, nil)
	}
	internalStorageInt, err := strconv.Atoi(body.InternalStorage)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Internal Storage harus berupa angka",
			En: "Internal Storage must be an integer",
		}, nil)
	}

	var existing model.ProductMemory
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Memory tidak ditemukan",
			En: "Memory not found",
		}, nil)
	}

	key := generateKeyFromName(body.Ram, body.InternalStorage)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductMemory
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, types.Language{
				Id: "Memory dengan nama ini sudah ada",
				En: "Memory with this name already exists",
			}, nil)
		}
	}

	existing.Key = key
	existing.Ram = ramInt
	existing.InternalStorage = internalStorageInt
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui memory",
			En: "Failed to update memory",
		}, nil)
	}

	RegenerateItemKeysByAttribute("memory", existing.ID)

	return dto.OK(c, types.Language{
		Id: "Memory berhasil diperbarui",
		En: "Memory updated successfully",
	}, fiber.Map{
		"memory": existing.Map(),
	})
}

func MemoryRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductMemory{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus memory",
			En: "Failed to delete memory",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Memory berhasil dihapus",
		En: "Memory deleted successfully",
	}, nil)
}

func MemoryBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.
		Delete(&model.ProductMemory{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus memory",
			En: "Failed to delete memory",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: fmt.Sprintf("Berhasil menghapus %d memory", len(body.IDs)),
		En: fmt.Sprintf("Success delete %d memories", len(body.IDs)),
	}, nil)
}
