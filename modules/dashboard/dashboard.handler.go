package dashboard

import (
	"react-go/dto"
	model "react-go/modules/dashboard/model"
	"react-go/variable"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

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

func WidgetCreate(c *fiber.Ctx) error {
	var body struct {
		RoleID       uint   `json:"role_id"`
		ComponentKey string `json:"component_key"`
		Key          string `json:"key"`
		Type         string `json:"type"`
		Col          int    `json:"col"`
		Label        string `json:"label"`
		Description  string `json:"description"`
	}
	if err := c.BodyParser(&body); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	if body.RoleID == 0 {
		return dto.BadRequest(c, "role_id is required", nil)
	}
	if body.ComponentKey == "" {
		return dto.BadRequest(c, "component_key is required", nil)
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
	if body.Col == 0 {
		body.Col = 12
	}

	// Check if combination already exists
	var existing model.DashboardWidget
	if err := variable.Db.Where("role_id = ? AND component_key = ? AND key = ?", body.RoleID, body.ComponentKey, body.Key).First(&existing).Error; err == nil {
		return dto.BadRequest(c, "Widget with this component_key and key already exists for this role", nil)
	}

	widget := model.DashboardWidget{
		RoleID:       body.RoleID,
		ComponentKey: body.ComponentKey,
		Key:          body.Key,
		Type:         body.Type,
		Col:          body.Col,
		Label:        body.Label,
		Description:  body.Description,
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
	if err := variable.Db.Where("role_id = ?", roleID).Order("component_key ASC").Find(&widgets).Error; err != nil {
		return dto.InternalServerError(c, "Failed to get widgets", nil)
	}

	return dto.OK(c, "Widgets retrieved successfully", widgets)
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
		Type        *string `json:"type"`
		Col         *int    `json:"col"`
		Label       *string `json:"label"`
		Description *string `json:"description"`
	}
	if err := c.BodyParser(&body); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	updates := map[string]interface{}{}
	if body.Type != nil {
		updates["type"] = *body.Type
	}
	if body.Col != nil {
		updates["col"] = *body.Col
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
