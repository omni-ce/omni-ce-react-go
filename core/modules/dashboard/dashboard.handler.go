package dashboard

import (
	"encoding/json"
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/dashboard/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func ListFunctions(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Berhasil mendapatkan fungsi",
		En: "Functions retrieved successfully",
	}, RegisterFunctions)
}

type DashboardStats struct {
	TotalQueues    int64 `json:"total_queues"`
	TotalMessages  int64 `json:"total_messages"`
	TotalCompleted int64 `json:"total_completed"`
	TotalFailed    int64 `json:"total_failed"`
	TotalTiming    int64 `json:"total_timing"`
	TotalPending   int64 `json:"total_pending"`
}

// ─── Widget CRUD ────────────────────────────────────────────────────

func WidgetCreate(c *fiber.Ctx) error {
	var body struct {
		RoleID      uint           `json:"role_id" validate:"required"`
		Type        string         `json:"type" validate:"required"`
		FunctionKey string         `json:"function_key" validate:"required"`
		Col         map[string]int `json:"col" validate:"required"`
		Label       string         `json:"label" validate:"required"`
		Description string         `json:"description" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Body request tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	if body.Col["mobile"] == 0 {
		body.Col["mobile"] = 12
	}
	if body.Col["tablet"] == 0 {
		body.Col["tablet"] = 6
	}
	if body.Col["laptop"] == 0 {
		body.Col["laptop"] = 4
	}
	if body.Col["desktop"] == 0 {
		body.Col["desktop"] = 3
	}

	// Check if combination already exists
	var existing model.DashboardWidget
	if err := variable.Db.
		Where("role_id = ? AND type = ? AND function_key = ?", body.RoleID, body.Type, body.FunctionKey).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Widget dengan function_key dan key ini sudah ada untuk role ini",
			En: "Widget with this function_key and key already exists for this role",
		}, nil)
	}

	// json stringified
	colJSON, err := json.Marshal(body.Col)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mem-marshal col",
			En: "Failed to marshal col",
		}, nil)
	}

	widget := model.DashboardWidget{
		RoleID:      body.RoleID,
		Type:        body.Type,
		FunctionKey: body.FunctionKey,
		Col:         string(colJSON),
		Label:       body.Label,
		Description: body.Description,
	}
	if err := variable.Db.
		Create(&widget).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Widget dengan function_key dan key ini sudah ada untuk role ini",
				En: "Widget with this function_key and key already exists for this role",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat widget",
			En: "Failed to create widget",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Widget berhasil dibuat",
		En: "Widget created successfully",
	}, widget)
}

func WidgetList(c *fiber.Ctx) error {
	roleIDStr := c.Query("role_id")
	if roleIDStr == "" {
		return dto.BadRequest(c, types.Language{
			Id: "role_id query parameter tidak ada",
			En: "role_id query parameter is required",
		}, nil)
	}

	roleID, err := strconv.ParseUint(roleIDStr, 10, 64)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "role_id tidak valid",
			En: "Invalid role_id",
		}, nil)
	}

	widgets := make([]model.DashboardWidget, 0)
	if err := variable.Db.
		Where("role_id = ?", roleID).
		Order("function_key ASC").
		Find(&widgets).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengambil data widget",
			En: "Failed to get widgets",
		}, nil)
	}

	rows := make([]map[string]interface{}, 0)
	for _, widget := range widgets {
		var col map[string]int
		if err := json.Unmarshal([]byte(widget.Col), &col); err != nil {
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mem-marshal col",
				En: "Failed to unmarshal col",
			}, nil)
		}
		rows = append(rows, map[string]interface{}{
			"id":           widget.ID,
			"type":         widget.Type,
			"function_key": widget.FunctionKey,
			"col":          col,
			"label":        widget.Label,
			"description":  widget.Description,
		})
	}

	return dto.OK(c, types.Language{
		Id: "Widget berhasil diambil",
		En: "Widgets retrieved successfully",
	}, rows)
}

func WidgetEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak ada",
			En: "ID is required",
		}, nil)
	}

	var body struct {
		Col         *map[string]int `json:"col" validate:"omitempty"`
		Label       *string         `json:"label" validate:"omitempty"`
		Description *string         `json:"description" validate:"omitempty"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Body request tidak valid",
			En: "Invalid request body",
		}, nil)
	}

	var widget model.DashboardWidget
	if err := variable.Db.
		Where("id = ?", id).
		First(&widget).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Widget tidak ditemukan",
			En: "Widget not found",
		}, nil)
	}

	updates := map[string]interface{}{}
	if body.Col != nil {
		col := *body.Col
		if col["mobile"] == 0 {
			col["mobile"] = 12
		}
		if col["tablet"] == 0 {
			col["tablet"] = 6
		}
		if col["laptop"] == 0 {
			col["laptop"] = 4
		}
		if col["desktop"] == 0 {
			col["desktop"] = 3
		}
		colJSON, err := json.Marshal(col)
		if err != nil {
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mem-marshal col",
				En: "Failed to marshal col",
			}, nil)
		}
		updates["col"] = string(colJSON)
	}
	if body.Label != nil {
		updates["label"] = *body.Label
	}
	if body.Description != nil {
		updates["description"] = *body.Description
	}

	if len(updates) == 0 {
		return dto.BadRequest(c, types.Language{
			Id: "Tidak ada field yang diupdate",
			En: "No fields to update",
		}, nil)
	}

	if err := variable.Db.
		Model(&widget).
		Updates(updates).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengupdate widget",
			En: "Failed to update widget",
		}, nil)
	}

	// Reload
	variable.Db.Where("id = ?", id).First(&widget)

	return dto.OK(c, types.Language{
		Id: "Widget berhasil diupdate",
		En: "Widget updated successfully",
	}, widget)
}

func WidgetRemove(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak ada",
			En: "ID is required",
		}, nil)
	}

	var widget model.DashboardWidget
	if err := variable.Db.
		Where("id = ?", id).
		First(&widget).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Widget tidak ditemukan",
			En: "Widget not found",
		}, nil)
	}

	if err := variable.Db.
		Delete(&widget).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus widget",
			En: "Failed to delete widget",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Widget berhasil dihapus",
		En: "Widget deleted successfully",
	}, nil)
}
