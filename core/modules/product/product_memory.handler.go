package product

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/product/model"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func MemoryCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Ram             string `json:"ram" validate:"required"`
		InternalStorage string `json:"internal_storage" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	ramInt, err := strconv.Atoi(body.Ram)
	if err != nil {
		return dto.BadRequest(c, "RAM must be an integer", nil)
	}
	internalStorageInt, err := strconv.Atoi(body.InternalStorage)
	if err != nil {
		return dto.BadRequest(c, "Internal Storage must be an integer", nil)
	}

	key := generateKeyFromName(body.Ram, body.InternalStorage)

	// Check duplicate key
	var existing model.ProductMemory
	if err := variable.Db.
		Where("`key` = ?", key).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Memory with this name already exists", nil)
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
		return dto.InternalServerError(c, "Failed to create memory", nil)
	}

	return dto.Created(c, "Memory created", fiber.Map{
		"memory": memory.Map(),
	})
}

func MemoryPaginate(c *fiber.Ctx) error {
	var memories []model.ProductMemory
	pagination, err := function.Pagination(c, &model.ProductMemory{}, nil, []string{"name", "key"}, &memories)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	rows := make([]map[string]any, 0, len(memories))
	for _, cat := range memories {
		rows = append(rows, cat.Map())
	}

	return dto.OK(c, "Success get memories", fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func MemoryEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Ram             string `json:"ram" validate:"required"`
		InternalStorage string `json:"internal_storage" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	ramInt, err := strconv.Atoi(body.Ram)
	if err != nil {
		return dto.BadRequest(c, "RAM must be an integer", nil)
	}
	internalStorageInt, err := strconv.Atoi(body.InternalStorage)
	if err != nil {
		return dto.BadRequest(c, "Internal Storage must be an integer", nil)
	}

	var existing model.ProductMemory
	if err := variable.Db.
		First(&existing, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, "Memory not found", nil)
	}

	key := generateKeyFromName(body.Ram, body.InternalStorage)

	// Check duplicate key if changed
	if key != existing.Key {
		var dup model.ProductMemory
		if err := variable.Db.
			Where("`key` = ? AND id != ?", key, id).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, "Memory with this name already exists", nil)
		}
	}

	existing.Key = key
	existing.Ram = ramInt
	existing.InternalStorage = internalStorageInt
	existing.UpdatedBy = currentUser.ID

	if err := variable.Db.
		Save(&existing).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to update memory", nil)
	}

	return dto.OK(c, "Memory updated", fiber.Map{
		"memory": existing.Map(),
	})
}

func MemoryRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&model.ProductMemory{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete memory", nil)
	}

	return dto.OK(c, "Memory deleted", nil)
}

func MemoryBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.
		Delete(&model.ProductMemory{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete memories", nil)
	}

	return dto.OK(c, fmt.Sprintf("Success delete %d memories", len(body.IDs)), nil)
}
