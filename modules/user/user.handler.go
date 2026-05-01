package user

import (
	"os"
	"path/filepath"
	"react-go/dto"
	"react-go/function"
	"react-go/function/hash"
	notification "react-go/modules/notification/model"
	model "react-go/modules/user/model"
	"react-go/socket"
	"react-go/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func Me(on string) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		user, err := function.JwtGetUser(c)
		if err != nil {
			return dto.InternalServerError(c, err.Error(), nil)
		}

		return dto.OK(c, "Success get user", fiber.Map{
			"user": user.Map(),
		})
	}
}

func ChangePassword(on string) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		existing, err := function.JwtGetUser(c)
		if err != nil {
			return dto.Unauthorized(c, "Unauthorized", nil)
		}

		var body struct {
			PreviousPassword string `json:"previous_password"`
			Password         string `json:"password"`
		}
		if err := c.BodyParser(&body); err != nil {
			return dto.BadRequest(c, "Invalid request body", nil)
		}

		if err := variable.Db.
			Model(&existing).
			Update("password", hash.Password(body.Password)).
			Error; err != nil {
			return dto.InternalServerError(c, "Failed to update user", nil)
		}

		// Send notification to user about password change
		socket.SendNotification(existing.ID.String(), notification.Notification{
			Type:    notification.NotificationTypeWarning,
			Title:   "Your password was changed",
			Message: "An administrator has changed your account password.",
		})

		return dto.OK(c, "Success update user", fiber.Map{
			"user": existing.Map(),
		})
	}
}

// TODO: Management
func Create(c *fiber.Ctx) error {
	// Only SU can create users
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	if currentUser.Role != model.UserRoleAdmin {
		return dto.Forbidden(c, "Only super admin can create users", nil)
	}

	var req struct {
		Name     string `json:"name" validate:"required,min=3,max=100"`
		Username string `json:"username" validate:"required,min=5,max=20"`
		Password string `json:"password" validate:"required,min=8,max=50"`
	}
	if err := function.RequestBody(c, &req); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	// Check duplicate username
	var existing model.User
	if err := variable.Db.
		Where("username = ?", req.Username).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Username already exists", nil)
	}

	user := model.User{
		Name:     strings.TrimSpace(req.Name),
		Username: strings.TrimSpace(req.Username),
		Password: hash.Password(req.Password),
		Role:     model.UserRoleClient,
	}
	if err := variable.Db.Create(&user).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create user", nil)
	}

	return dto.Created(c, "User created", fiber.Map{
		"user": user.Map(),
	})
}

func Paginate(c *fiber.Ctx) error {
	users := make([]model.User, 0)
	pagination, err := function.Pagination(c, &model.User{}, func(query *gorm.DB) *gorm.DB {
		return query.Where("role = ?", model.UserRoleClient)
	}, []string{"name", "username", "role"}, &users)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	result := make([]map[string]any, 0, len(users))
	for i := range users {
		user := users[i].Map()
		result = append(result, user)
	}

	return dto.OK(c, "Success get users", fiber.Map{
		"rows":       result,
		"pagination": pagination.Meta(),
	})
}

func handleAvatarUpload(c *fiber.Ctx, currentAvatar string, userID string) (string, error) {
	avatarFile, _ := c.FormFile("avatar")
	if avatarFile == nil {
		return "", nil
	}

	if err := os.MkdirAll("avatar", 0755); err != nil {
		return "", err
	}

	ext := strings.ToLower(filepath.Ext(avatarFile.Filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
	default:
		ext = ".jpeg"
	}

	cleanAvatar := filepath.Base(strings.TrimSpace(currentAvatar))
	baseName := strings.TrimSuffix(cleanAvatar, filepath.Ext(cleanAvatar))
	if baseName == "" {
		baseName = userID
	}

	newFilename := baseName + ext
	newFilePath := filepath.Join("avatar", newFilename)
	if err := c.SaveFile(avatarFile, newFilePath); err != nil {
		return "", err
	}

	if cleanAvatar != "" && cleanAvatar != newFilename {
		_ = os.Remove(filepath.Join("avatar", cleanAvatar))
	}

	return newFilename, nil
}

func Edit(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid user id", nil)
	}

	var req struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := function.RequestBody(c, &req); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.User
	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.NotFound(c, "User not found", nil)
	}

	updates := map[string]any{}

	name := strings.TrimSpace(req.Name)
	if name != "" {
		updates["name"] = name
	}

	username := strings.TrimSpace(req.Username)
	if username != "" && username != existing.Username {
		// Check duplicate username
		var dup model.User
		if err := variable.Db.Where("username = ? AND id != ?", username, id.String()).First(&dup).Error; err == nil {
			return dto.BadRequest(c, "Username already exists", nil)
		}
		updates["username"] = username
	}

	password := strings.TrimSpace(req.Password)
	if password != "" {
		updates["password"] = hash.Password(password)
	}

	if len(updates) == 0 {
		return dto.BadRequest(c, "No data to update", nil)
	}

	if err := variable.Db.Model(&existing).Updates(updates).Error; err != nil {
		return dto.InternalServerError(c, "Failed to update user", nil)
	}
	if err := variable.Db.First(&existing, "id = ?", id.String()).Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch updated user", nil)
	}

	// Send notification to edited user
	socket.SendNotification(id.String(), notification.Notification{
		Type:    notification.NotificationTypeInfo,
		Title:   "Your profile was updated",
		Message: "An administrator has updated your profile information.",
	})

	return dto.OK(c, "Success update user", fiber.Map{
		"user": existing.Map(),
	})
}

func Remove(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid user id", nil)
	}

	// Only SU can delete users
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	if currentUser.Role != model.UserRoleAdmin {
		return dto.Forbidden(c, "Only super admin can delete users", nil)
	}

	// Prevent self-deletion
	if currentUser.ID.String() == id.String() {
		return dto.BadRequest(c, "Cannot delete yourself", nil)
	}

	if err = variable.Db.
		Delete(&model.User{}, "id = ?", id.String()).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete user", nil)
	}

	return dto.OK(c, "Success delete user", nil)
}

func BulkRemove(c *fiber.Ctx) error {
	// Only SU can bulk delete users
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	if currentUser.Role != model.UserRoleAdmin {
		return dto.Forbidden(c, "Only super admin can bulk delete users", nil)
	}

	var req struct {
		IDs []string `json:"ids"`
	}
	if err := c.BodyParser(&req); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	if len(req.IDs) == 0 {
		return dto.BadRequest(c, "No IDs provided", nil)
	}

	// Filter out self
	validIDs := make([]string, 0, len(req.IDs))
	for _, idStr := range req.IDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			continue
		}
		// Skip self
		if id.String() == currentUser.ID.String() {
			continue
		}
		var user model.User
		if err := variable.Db.
			Where("id = ? AND role = ?", id.String(), model.UserRoleClient).
			First(&user).
			Error; err != nil {
			continue
		}
		validIDs = append(validIDs, id.String())
	}

	if len(validIDs) == 0 {
		return dto.BadRequest(c, "No valid users to delete", nil)
	}

	if err := variable.Db.
		Delete(&model.User{}, "id IN ?", validIDs).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete users", nil)
	}

	return dto.OK(c, "Success bulk delete users", fiber.Map{
		"deleted_count": len(validIDs),
	})
}

func SetActive(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid user id", nil)
	}

	// Only SU can toggle active status
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	if currentUser.Role != model.UserRoleAdmin {
		return dto.Forbidden(c, "Only super admin can toggle user status", nil)
	}

	var existing model.User
	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.NotFound(c, "User not found", nil)
	}

	// Prevent deactivating self
	if existing.ID == currentUser.ID {
		return dto.BadRequest(c, "Cannot deactivate yourself", nil)
	}

	newStatus := !existing.IsActive
	if err := variable.Db.
		Model(&existing).
		Update("is_active", newStatus).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle user status", nil)
	}

	return dto.OK(c, "Success toggle user status", fiber.Map{
		"user": existing.Map(),
	})
}

func RoleSwitch(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid user id", nil)
	}

	// Only SU can switch roles
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	if currentUser.Role != model.UserRoleAdmin {
		return dto.Forbidden(c, "Only super admin can switch user roles", nil)
	}

	var existing model.User
	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.NotFound(c, "User not found", nil)
	}

	newRole := model.UserRoleClient
	if strings.EqualFold(existing.Role, model.UserRoleClient) {
		newRole = model.UserRoleAdmin
	}

	if err := variable.Db.
		Model(&existing).
		Update("role", newRole).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to switch role", nil)
	}

	// Send notification to user about role change
	socket.SendNotification(id.String(), notification.Notification{
		Type:    notification.NotificationTypeSystem,
		Title:   "Your role has been changed",
		Message: "An administrator has changed your role to " + newRole + ".",
	})

	return dto.OK(c, "Success switch role", fiber.Map{
		"user": existing.Map(),
	})
}
