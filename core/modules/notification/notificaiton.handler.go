package notification

import (
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/notification/model"
	"react-go/core/variable"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// NextData returns the next 10 notifications after the given cursor ID.
// GET /next/:id — id=0 means fetch the first 10 (latest).
func NextData(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	userID := claims.ID

	cursorID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	var notifications []model.Notification
	query := variable.Db.Where("user_id = ?", userID).Order("id DESC").Limit(10)
	if cursorID > 0 {
		query = query.Where("id < ?", cursorID)
	}
	if err := query.Find(&notifications).Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch notifications", nil)
	}

	return dto.OK(c, "Success", notifications)
}

// MarkRead marks multiple notifications as read.
// POST /mark-read — body: { "ids": [1, 2, 3] }
func MarkRead(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	userID := claims.ID

	var body struct {
		IDs []uint `json:"ids" validate:"required,dive,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	now := time.Now()
	if err := variable.Db.
		Model(&model.Notification{}).
		Where("id IN ? AND user_id = ?", body.IDs, userID).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error; err != nil {
		return dto.InternalServerError(c, "Failed to mark as read", nil)
	}

	return dto.OK(c, "Marked as read", nil)
}

// ToggleRead toggles the read status of a single notification.
// POST /toggle-read — body: { "id": 1 }
func ToggleRead(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	userID := claims.ID

	var body struct {
		ID uint `json:"id" validate:"required,dive,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var notif model.Notification
	if err := variable.Db.
		Where("id = ? AND user_id = ?", body.ID, userID).
		First(&notif).
		Error; err != nil {
		return dto.NotFound(c, "Notification not found", nil)
	}

	newIsRead := !notif.IsRead
	updates := map[string]interface{}{
		"is_read": newIsRead,
	}
	if newIsRead {
		updates["read_at"] = time.Now()
	} else {
		updates["read_at"] = nil
	}

	if err := variable.Db.
		Model(&notif).
		Updates(updates).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle read", nil)
	}

	return dto.OK(c, "Toggled", map[string]interface{}{
		"id":      notif.ID,
		"is_read": newIsRead,
	})
}

// Delete removes a single notification.
// DELETE /delete/:id
func Delete(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	userID := claims.ID

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, "Invalid ID", nil)
	}

	now := time.Now()

	result := variable.Db.
		Model(&model.Notification{}).
		Where("id = ? AND user_id = ?", id, userID).
		Updates(&model.Notification{DeletedAt: &now})
	if result.Error != nil {
		return dto.InternalServerError(c, "Failed to delete", nil)
	}
	if result.RowsAffected == 0 {
		return dto.NotFound(c, "Notification not found", nil)
	}

	return dto.OK(c, "Deleted", nil)
}

// ClearAll removes all notifications for the current user.
// DELETE /clear-all
func ClearAll(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	userID, err := uuid.Parse(claims.ID)
	if err != nil {
		return dto.BadRequest(c, "Invalid user ID", nil)
	}

	now := time.Now()

	if err := variable.Db.
		Model(&model.Notification{}).
		Where("user_id = ?", userID).
		Updates(&model.Notification{DeletedAt: &now}).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to clear all", nil)
	}

	return dto.OK(c, "All cleared", nil)
}
