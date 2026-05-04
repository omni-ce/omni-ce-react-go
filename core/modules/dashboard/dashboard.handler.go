package dashboard

import (
	"encoding/json"
	"react-go/core/dto"
	model "react-go/core/modules/dashboard/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ListFunctions(c *fiber.Ctx) error {
	return dto.OK(c, "Functions retrieved successfully", registerFunctions)
}

func ExecuteFunction(c *fiber.Ctx) error {
	_type := c.Params("type")
	if _type == "" {
		return dto.BadRequest(c, "type is required", nil)
	}
	key := c.Params("key")
	if key == "" {
		return dto.BadRequest(c, "key is required", nil)
	}

	function, err := findFunction(_type, key)
	if err != nil {
		return dto.InternalServerError(c, err.Error(), nil)
	}

	return dto.OK(c, "Functions retrieved successfully", function(types.FunctionRequest{
		RoleID: 1,
		UserID: "1",
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
	}))
}

type DashboardStats struct {
	TotalQueues    int64 `json:"total_queues"`
	TotalMessages  int64 `json:"total_messages"`
	TotalCompleted int64 `json:"total_completed"`
	TotalFailed    int64 `json:"total_failed"`
	TotalTiming    int64 `json:"total_timing"`
	TotalPending   int64 `json:"total_pending"`
}

func GetStats(c *fiber.Ctx) error {
	var stats DashboardStats

	db := variable.Db.Session(&gorm.Session{Logger: logger.Default.LogMode(logger.Silent)}) // silent mode to avoid noise

	// Total queues
	db.Table("queues").Count(&stats.TotalQueues)

	// Total messages (all statuses)
	db.Table("queue_messages").Count(&stats.TotalMessages)

	// Count by status
	db.Table("queue_messages").Where("status = ?", "completed").Count(&stats.TotalCompleted)
	db.Table("queue_messages").Where("status = ? AND is_ack = false", "failed").Count(&stats.TotalFailed)
	db.Table("queue_messages").Where("status = ?", "timing").Count(&stats.TotalTiming)
	db.Table("queue_messages").Where("status = ?", "pending").Count(&stats.TotalPending)

	return dto.OK(c, "Dashboard stats retrieved successfully", stats)
}

// ─── Widget CRUD ────────────────────────────────────────────────────

func WidgetFunctions(c *fiber.Ctx) error {
	return dto.OK(c, "Widget deleted successfully", nil)
}

func WidgetCreate(c *fiber.Ctx) error {
	var body struct {
		RoleID      uint           `json:"role_id"`
		FunctionKey string         `json:"function_key"`
		Key         string         `json:"key"`
		Type        string         `json:"type"`
		Col         map[string]int `json:"col"`
		Label       string         `json:"label"`
		Description string         `json:"description"`
	}
	if err := c.BodyParser(&body); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	if body.RoleID == 0 {
		return dto.BadRequest(c, "role_id is required", nil)
	}
	if body.FunctionKey == "" {
		return dto.BadRequest(c, "function_key is required", nil)
	}
	if body.Key == "" {
		return dto.BadRequest(c, "key is required", nil)
	}
	if body.Type == "" {
		return dto.BadRequest(c, "type is required", nil)
	}
	if body.Label == "" {
		return dto.BadRequest(c, "label is required", nil)
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
	if err := variable.Db.Where("role_id = ? AND function_key = ? AND key = ?", body.RoleID, body.FunctionKey, body.Key).First(&existing).Error; err == nil {
		return dto.BadRequest(c, "Widget with this function_key and key already exists for this role", nil)
	}

	// json stringified
	colJSON, err := json.Marshal(body.Col)
	if err != nil {
		return dto.InternalServerError(c, "Failed to marshal col", nil)
	}

	widget := model.DashboardWidget{
		RoleID:      body.RoleID,
		FunctionKey: body.FunctionKey,
		Key:         body.Key,
		Type:        body.Type,
		Col:         string(colJSON),
		Label:       body.Label,
		Description: body.Description,
	}
	if err := variable.Db.Create(&widget).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create widget", nil)
	}

	return dto.Created(c, "Widget created successfully", widget)
}

func WidgetList(c *fiber.Ctx) error {
	roleIDStr := c.Query("role_id")
	if roleIDStr == "" {
		return dto.BadRequest(c, "role_id query parameter is required", nil)
	}

	roleID, err := strconv.ParseUint(roleIDStr, 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid role_id", nil)
	}

	widgets := make([]model.DashboardWidget, 0)
	if err := variable.Db.Where("role_id = ?", roleID).Order("function_key ASC").Find(&widgets).Error; err != nil {
		return dto.InternalServerError(c, "Failed to get widgets", nil)
	}

	rows := make([]map[string]interface{}, 0)
	for _, widget := range widgets {
		var col map[string]int
		if err := json.Unmarshal([]byte(widget.Col), &col); err != nil {
			return dto.InternalServerError(c, "Failed to unmarshal col", nil)
		}
		rows = append(rows, map[string]interface{}{
			"id":           widget.ID,
			"function_key": widget.FunctionKey,
			"key":          widget.Key,
			"type":         widget.Type,
			"col":          col,
			"label":        widget.Label,
			"description":  widget.Description,
		})
	}

	return dto.OK(c, "Widgets retrieved successfully", rows)
}

func WidgetEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return dto.BadRequest(c, "ID is required", nil)
	}

	var widget model.DashboardWidget
	if err := variable.Db.Where("id = ?", id).First(&widget).Error; err != nil {
		return dto.NotFound(c, "Widget not found", nil)
	}

	var body struct {
		Type        *string         `json:"type"`
		Col         *map[string]int `json:"col"`
		Label       *string         `json:"label"`
		Description *string         `json:"description"`
	}
	if err := c.BodyParser(&body); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	updates := map[string]interface{}{}
	if body.Type != nil {
		updates["type"] = *body.Type
	}
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
			return dto.InternalServerError(c, "Failed to marshal col", nil)
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
		return dto.BadRequest(c, "No fields to update", nil)
	}

	if err := variable.Db.Model(&widget).Updates(updates).Error; err != nil {
		return dto.InternalServerError(c, "Failed to update widget", nil)
	}

	// Reload
	variable.Db.Where("id = ?", id).First(&widget)

	return dto.OK(c, "Widget updated successfully", widget)
}

func WidgetRemove(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return dto.BadRequest(c, "ID is required", nil)
	}

	var widget model.DashboardWidget
	if err := variable.Db.Where("id = ?", id).First(&widget).Error; err != nil {
		return dto.NotFound(c, "Widget not found", nil)
	}

	if err := variable.Db.Delete(&widget).Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete widget", nil)
	}

	return dto.OK(c, "Widget deleted successfully", nil)
}
