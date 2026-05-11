package whitelist

import (
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/whitelist/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func GetAll(c *fiber.Ctx) error {
	entries := make([]model.Whitelist, 0)
	if err := variable.Db.
		Order("created_at DESC").
		Find(&entries).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengambil whitelist entries",
			En: "Failed to get whitelist entries",
		}, nil)
	}
	return dto.OK(c, types.Language{
		Id: "Berhasil mengambil whitelist entries",
		En: "Whitelist entries retrieved successfully",
	}, entries)
}

func Create(c *fiber.Ctx) error {
	var body struct {
		Type  string  `json:"type" validate:"required"`
		Value string  `json:"value" validate:"required"`
		Label *string `json:"label,omitempty" validate:"omitempty"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Gagal memvalidasi request body",
			En: "Failed to validate request body",
		}, err.Error())
	}

	if body.Type != "ip" && body.Type != "domain" {
		return dto.BadRequest(c, types.Language{
			Id: "Tipe harus 'ip' atau 'domain'",
			En: "Type must be 'ip' or 'domain'",
		}, nil)
	}
	if body.Value == "" {
		return dto.BadRequest(c, types.Language{
			Id: "Value harus diisi",
			En: "Value is required",
		}, nil)
	}

	// Check if value already exists
	var existing model.Whitelist
	if err := variable.Db.
		Where("value = ?", body.Value).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Entry dengan value ini sudah ada",
			En: "Entry with this value already exists",
		}, nil)
	}

	entry := model.Whitelist{
		Type:  body.Type,
		Value: body.Value,
		Label: body.Label,
	}
	if err := variable.Db.
		Create(&entry).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Entry dengan value ini sudah ada",
				En: "Entry with this value already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat whitelist entry",
			En: "Failed to create whitelist entry",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Berhasil membuat whitelist entry",
		En: "Whitelist entry created successfully",
	}, entry)
}

func Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return dto.BadRequest(c, types.Language{
			Id: "ID harus diisi",
			En: "ID is required",
		}, nil)
	}

	var entry model.Whitelist
	if err := variable.Db.
		Where("id = ?", id).
		First(&entry).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Entry tidak ditemukan",
			En: "Entry not found",
		}, nil)
	}

	if err := variable.Db.
		Delete(&entry).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus whitelist entry",
			En: "Failed to delete whitelist entry",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Berhasil menghapus whitelist entry",
		En: "Whitelist entry deleted successfully",
	}, nil)
}
