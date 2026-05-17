package notification

import (
	"react-go/core/dto"
	"react-go/core/function"
	notification "react-go/core/modules/notification/model"
	"react-go/core/types"
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
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak ada hak akses",
			En: "Unauthorized",
		}, nil)
	}
	userID := claims.ID

	cursorID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid ID",
		}, nil)
	}

	var notifications []notification.Notification
	query := variable.Db.Where("user_id = ?", userID).Order("id DESC").Limit(10)
	if cursorID > 0 {
		query = query.Where("id < ?", cursorID)
	}
	if err := query.Find(&notifications).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengambil data notifikasi",
			En: "Failed to fetch notifications",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Data notifikasi berhasil diambil",
		En: "Notifications retrieved successfully",
	}, notifications)
}

// MarkRead marks multiple notifications as read.
// POST /mark-read — body: { "ids": [1, 2, 3] }
func MarkRead(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak ada hak akses",
			En: "Unauthorized",
		}, nil)
	}
	userID := claims.ID

	var body struct {
		IDs []uint `json:"ids" validate:"required,dive,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	now := time.Now()
	if err := variable.Db.
		Model(&notification.Notification{}).
		Where("id IN ? AND user_id = ?", body.IDs, userID).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menandai notifikasi sebagai sudah dibaca",
			En: "Failed to mark notifications as read",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Notifikasi berhasil ditandai sebagai sudah dibaca",
		En: "Notifications marked as read successfully",
	}, nil)
}

// ToggleRead toggles the read status of a single notification.
// POST /toggle-read — body: { "id": 1 }
func ToggleRead(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak ada hak akses",
			En: "Unauthorized",
		}, nil)
	}
	userID := claims.ID

	var body struct {
		ID uint `json:"id" validate:"required,dive,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var notif notification.Notification
	if err := variable.Db.
		Where("id = ? AND user_id = ?", body.ID, userID).
		First(&notif).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Notifikasi tidak ditemukan",
			En: "Notification not found",
		}, nil)
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menandai notifikasi sebagai sudah dibaca",
			En: "Failed to mark notifications as read",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Notifikasi berhasil ditandai sebagai sudah dibaca",
		En: "Notifications marked as read successfully",
	}, map[string]interface{}{
		"id":      notif.ID,
		"is_read": newIsRead,
	})
}

// Delete removes a single notification.
// DELETE /delete/:id
func Delete(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak ada hak akses",
			En: "Unauthorized",
		}, nil)
	}
	userID := claims.ID

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid ID",
		}, nil)
	}

	now := time.Now()

	result := variable.Db.
		Model(&notification.Notification{}).
		Where("id = ? AND user_id = ?", id, userID).
		Updates(&notification.Notification{DeletedAt: &now})
	if result.Error != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus notifikasi",
			En: "Failed to delete notification",
		}, nil)
	}
	if result.RowsAffected == 0 {
		return dto.NotFound(c, types.Language{
			Id: "Notifikasi tidak ditemukan",
			En: "Notification not found",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Notifikasi berhasil dihapus",
		En: "Notification deleted successfully",
	}, nil)
}

// ClearAll removes all notifications for the current user.
// DELETE /clear-all
func ClearAll(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak ada hak akses",
			En: "Unauthorized",
		}, nil)
	}
	userID, err := uuid.Parse(claims.ID)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tidak valid",
			En: "Invalid user ID",
		}, nil)
	}

	now := time.Now()

	if err := variable.Db.
		Model(&notification.Notification{}).
		Where("user_id = ?", userID).
		Updates(&notification.Notification{DeletedAt: &now}).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus semua notifikasi",
			En: "Failed to clear all notifications",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Semua notifikasi berhasil dihapus",
		En: "All notifications cleared successfully",
	}, nil)
}
