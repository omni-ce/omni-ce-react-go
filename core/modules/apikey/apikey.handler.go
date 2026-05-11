package apikey

import (
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/apikey/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetAll(c *fiber.Ctx) error {
	keys := make([]model.ApiKey, 0)
	if err := variable.Db.
		Order("created_at DESC").
		Find(&keys).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan API keys",
			En: "Failed to get API keys",
		}, fiber.Map{
			"error": err.Error(),
		})
	}
	return dto.OK(c, types.Language{
		Id: "API keys berhasil didapatkan",
		En: "API keys retrieved successfully",
	}, keys)
}

func Create(c *fiber.Ctx) error {
	var body struct {
		Name      string  `json:"name" validate:"required"`
		ExpiresAt *string `json:"expires_at,omitempty" validate:"omitempty"` // RFC3339
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Body tidak valid",
			En: "Invalid request body",
		}, fiber.Map{
			"error": err.Error(),
		})
	}

	entry := model.ApiKey{
		Name: body.Name,
	}

	if body.ExpiresAt != nil && *body.ExpiresAt != "" {
		parsed, err := time.Parse(time.RFC3339, *body.ExpiresAt)
		if err == nil {
			entry.ExpiresAt = &parsed
		}
	}

	if err := variable.Db.
		Create(&entry).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Nama API key sudah ada",
				En: "API key name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat API key",
			En: "Failed to create API key",
		}, nil)
	}
	return dto.OK(c, types.Language{
		Id: "API key berhasil dibuat",
		En: "API key created successfully",
	}, entry)
}

func Toggle(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak boleh kosong",
			En: "ID is required",
		}, nil)
	}

	var body struct {
		IsActive bool `json:"is_active" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Body tidak valid",
			En: "Invalid request body",
		}, fiber.Map{
			"error": err.Error(),
		})
	}

	var entry model.ApiKey
	if err := variable.Db.
		Where("id = ?", id).
		First(&entry).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "API key tidak ditemukan",
			En: "API key not found",
		}, nil)
	}

	entry.IsActive = body.IsActive
	if err := variable.Db.
		Save(&entry).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui API key",
			En: "Failed to update API key",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "API key berhasil diperbarui",
		En: "API key updated successfully",
	}, entry)
}

func Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak boleh kosong",
			En: "ID is required",
		}, nil)
	}

	var entry model.ApiKey
	if err := variable.Db.
		Where("id = ?", id).
		First(&entry).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "API key tidak ditemukan",
			En: "API key not found",
		}, nil)
	}

	if err := variable.Db.
		Delete(&entry).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus API key",
			En: "Failed to delete API key",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "API key berhasil dihapus",
		En: "API key deleted successfully",
	}, nil)
}
