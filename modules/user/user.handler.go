package user

import (
	"fmt"
	"os"
	"path/filepath"
	"react-go/dto"
	"react-go/function"
	"react-go/function/hash"
	notification "react-go/modules/notification/model"
	role "react-go/modules/role/model"
	model "react-go/modules/user/model"
	"react-go/socket"
	"react-go/types"
	"react-go/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

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

		// check if password == previous password
		if !hash.ValidatePassword(body.PreviousPassword, existing.Password) {
			return dto.BadRequest(c, "Password and previous password must be different", nil)
		}

		if err := variable.Db.
			Model(&existing).
			Update("password", hash.Password(body.Password)).
			Error; err != nil {
			return dto.InternalServerError(c, "Failed to update user", nil)
		}

		// Send notification to user about password change
		socket.SendNotification(existing.ID, types.Notification{
			Type:    notification.NotificationTypeWarning,
			Title:   types.Language{Id: "Kata sandi Anda diubah", En: "Your password was changed"},
			Message: types.Language{Id: "Administrator telah mengubah kata sandi akun Anda.", En: "An administrator has changed your account password."},
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

	var body struct {
		Name     string `json:"name" validate:"required,min=3,max=100"`
		Username string `json:"username" validate:"required,min=5,max=20"`
		Password string `json:"password" validate:"required,min=8,max=50"`
		Address  string `json:"address" validate:"required"`
		Roles    []struct {
			DivisionID string `json:"division_id"`
			RoleID     string `json:"role_id"`
		} `json:"roles" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	roleIds := make([]string, 0)
	for _, r := range body.Roles {
		roleIds = append(roleIds, r.RoleID)
	}

	roles := make([]role.Role, 0)
	if err := variable.Db.Where("id IN ?", roleIds).Find(&roles).Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch roles", nil)
	}
	if len(roles) != len(roleIds) {
		return dto.BadRequest(c, "Invalid role ids", nil)
	}

	// Check duplicate username
	var existing model.User
	if err := variable.Db.
		Where("username = ?", body.Username).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, "Username already exists", nil)
	}

	user := model.User{
		Name:     strings.TrimSpace(body.Name),
		Username: strings.TrimSpace(body.Username),
		Password: hash.Password(body.Password),
		Address:  strings.TrimSpace(body.Address),
		Role:     model.UserRoleClient,
	}

	errTx := variable.Db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		roleUsers := make([]role.RoleUser, 0)
		for _, r := range roles {
			roleUsers = append(roleUsers, role.RoleUser{
				RoleID: r.ID,
				UserID: user.ID,
			})
		}
		if len(roleUsers) > 0 {
			if err := tx.Create(&roleUsers).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if errTx != nil {
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

	userIds := make([]string, 0, len(users))
	for _, user := range users {
		userIds = append(userIds, user.ID.String())
	}

	roleUsers := make([]role.RoleUser, 0)
	if err := variable.Db.Where("user_id IN ?", userIds).Find(&roleUsers).Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch role users", nil)
	}

	roleIds := make([]uint, 0)
	for _, ru := range roleUsers {
		roleIds = append(roleIds, ru.RoleID)
	}

	roles := make([]role.Role, 0)
	if len(roleIds) > 0 {
		if err := variable.Db.Where("id IN ?", roleIds).Find(&roles).Error; err != nil {
			return dto.InternalServerError(c, "Failed to fetch roles", nil)
		}
	}

	result := make([]map[string]any, 0, len(users))
	for i := range users {
		user := users[i].Map()
		userRoles := make([]map[string]any, 0)
		for _, roleUser := range roleUsers {
			if roleUser.UserID.String() == users[i].ID.String() {
				for _, r := range roles {
					if r.ID == roleUser.RoleID {
						userRoles = append(userRoles, map[string]any{
							"division_id": fmt.Sprintf("%v", r.RoleDivisionID),
							"role_id":     fmt.Sprintf("%v", r.ID),
							"role_name":   r.Name,
						})
					}
				}
			}
		}
		user["roles"] = userRoles
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

	var body struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Address  string `json:"address"`
		Roles    []struct {
			DivisionID string `json:"division_id"`
			RoleID     string `json:"role_id"`
		} `json:"roles"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	roleIds := make([]string, 0)
	for _, r := range body.Roles {
		roleIds = append(roleIds, r.RoleID)
	}

	// check role ids
	roles := make([]role.Role, 0)
	if err := variable.Db.
		Where("id IN ?", roleIds).
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch roles", nil)
	}
	if len(roles) != len(roleIds) {
		return dto.BadRequest(c, "Invalid role ids", nil)
	}

	var existing model.User
	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.NotFound(c, "User not found", nil)
	}

	updates := map[string]any{}

	name := strings.TrimSpace(body.Name)
	if name != "" {
		updates["name"] = name
	}

	username := strings.TrimSpace(body.Username)
	if username != "" && username != existing.Username {
		// Check duplicate username
		var dup model.User
		if err := variable.Db.Where("username = ? AND id != ?", username, id.String()).First(&dup).Error; err == nil {
			return dto.BadRequest(c, "Username already exists", nil)
		}
		updates["username"] = username
	}

	address := strings.TrimSpace(body.Address)
	if address != "" {
		updates["address"] = address
	}

	if len(updates) == 0 && len(body.Roles) == 0 {
		return dto.BadRequest(c, "No data to update", nil)
	}

	errTx := variable.Db.Transaction(func(tx *gorm.DB) error {
		if len(updates) > 0 {
			if err := tx.Model(&existing).Updates(updates).Error; err != nil {
				return err
			}
		}

		// Update roles
		if err := tx.Where("user_id = ?", existing.ID).Delete(&role.RoleUser{}).Error; err != nil {
			return err
		}

		roleUsers := make([]role.RoleUser, 0)
		for _, r := range roles {
			roleUsers = append(roleUsers, role.RoleUser{
				RoleID: r.ID,
				UserID: existing.ID,
			})
		}
		if len(roleUsers) > 0 {
			if err := tx.Create(&roleUsers).Error; err != nil {
				return err
			}
		}

		return nil
	})
	if errTx != nil {
		return dto.InternalServerError(c, "Failed to update user", nil)
	}
	if err := variable.Db.First(&existing, "id = ?", id.String()).Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch updated user", nil)
	}

	// Send notification to edited user
	socket.SendNotification(id, types.Notification{
		Type:    notification.NotificationTypeInfo,
		Title:   types.Language{Id: "Profil Anda diperbarui", En: "Your profile was updated"},
		Message: types.Language{Id: "Administrator telah memperbarui informasi profil Anda.", En: "An administrator has updated your profile information."},
	})

	if s, ok := socket.UserNotification[id.String()]; ok {
		s.Emit("update-user", true)
	}

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

	var body struct {
		IDs []string `json:"ids"`
	}
	if err := c.BodyParser(&body); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	if len(body.IDs) == 0 {
		return dto.BadRequest(c, "No IDs provided", nil)
	}

	// Filter out self
	validIDs := make([]string, 0, len(body.IDs))
	for _, idStr := range body.IDs {
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
	socket.SendNotification(id, types.Notification{
		Type:    notification.NotificationTypeSystem,
		Title:   types.Language{Id: "Peran Anda telah diubah", En: "Your role has been changed"},
		Message: types.Language{Id: "Administrator telah mengubah peran Anda menjadi " + newRole + ".", En: "An administrator has changed your role to " + newRole + "."},
	})

	return dto.OK(c, "Success switch role", fiber.Map{
		"user": existing.Map(),
	})
}
