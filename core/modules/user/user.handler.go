package user

import (
	"fmt"
	"os"
	"path/filepath"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/function/hash"
	notification "react-go/core/modules/notification/model"
	role "react-go/core/modules/role/model"
	model "react-go/core/modules/user/model"
	"react-go/core/sse"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func ChangePassword(c *fiber.Ctx) error {
	existing, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotorisasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		PreviousPassword string `json:"previous_password" validate:"required"`
		Password         string `json:"password" validate:"required,min=8,max=50"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	// check if password == previous password
	if !hash.ValidatePassword(body.PreviousPassword, existing.Password) {
		return dto.BadRequest(c, types.Language{
			Id: "Password dan previous password harus berbeda",
			En: "Password and previous password must be different",
		}, nil)
	}

	if err := variable.Db.
		Model(&existing).
		Update("password", hash.Password(body.Password)).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui user",
			En: "Failed to update user",
		}, nil)
	}

	// Send notification to user about password change
	sse.SendNotification(existing.ID, existing.ID, types.Notification{
		Type:    notification.NotificationTypeWarning,
		Title:   types.Language{Id: "Kata sandi Anda diubah", En: "Your password was changed"},
		Message: types.Language{Id: "Administrator telah mengubah kata sandi akun Anda.", En: "An administrator has changed your account password."},
	})

	return dto.OK(c, types.Language{
		Id: "Berhasil memperbarui user",
		En: "Success update user",
	}, fiber.Map{
		"user": existing.Map(),
	})
}

// TODO: Management
func Create(c *fiber.Ctx) error {
	// Only SU can create users
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotorisasi",
			En: "Unauthorized",
		}, nil)
	}
	if currentUser.Role != model.UserRoleSuperAdmin {
		return dto.Forbidden(c, types.Language{
			Id: "Hanya super admin yang bisa membuat user",
			En: "Only super admin can create users",
		}, nil)
	}

	var body struct {
		Avatar   string `json:"avatar" validate:"required"`
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
		return dto.BodyBadRequest(c, err)
	}

	roleIds := make([]string, 0)
	for _, r := range body.Roles {
		roleIds = append(roleIds, r.RoleID)
	}

	roles := make([]role.Role, 0)
	if err := variable.Db.
		Where("id IN ?", roleIds).
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan role",
			En: "Failed to get role",
		}, nil)
	}
	if len(roles) != len(roleIds) {
		return dto.BadRequest(c, types.Language{
			Id: "Role tidak valid",
			En: "Invalid role",
		}, nil)
	}

	// Check duplicate username
	var existing model.User
	if err := variable.Db.
		Where("username = ?", body.Username).
		First(&existing).
		Error; err == nil {
		return dto.BadRequest(c, types.Language{
			Id: "Username sudah ada",
			En: "Username already exists",
		}, nil)
	}

	user := model.User{
		Avatar:          body.Avatar,
		Name:            strings.TrimSpace(body.Name),
		Username:        strings.TrimSpace(body.Username),
		Password:        hash.Password(body.Password),
		Address:         strings.TrimSpace(body.Address),
		Role:            model.UserRoleUser,
		CreatedByUserID: currentUser.ID,
		UpdatedByUserID: currentUser.ID,
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
		message := errTx.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Username sudah ada",
				En: "Username already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat user",
			En: "Failed to create user",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "User berhasil dibuat",
		En: "User created successfully",
	}, fiber.Map{
		"user": user.Map(),
	})
}

func Paginate(c *fiber.Ctx) error {
	users := make([]model.User, 0)
	pagination, err := function.Pagination(c, &model.User{}, func(query *gorm.DB) *gorm.DB {
		return query.Where("role = ?", model.UserRoleUser)
	}, []string{"name", "username", "role"}, &users)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mempersiapkan pagination",
			En: "Failed to prepare pagination",
		}, nil)
	}

	userIds := make([]string, 0, len(users))
	for _, user := range users {
		userIds = append(userIds, user.ID.String())
	}

	roleUsers := make([]role.RoleUser, 0)
	if err := variable.Db.
		Where("user_id IN ?", userIds).
		Find(&roleUsers).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan role users",
			En: "Failed to get role users",
		}, nil)
	}

	roleIds := make([]uint, 0)
	for _, ru := range roleUsers {
		roleIds = append(roleIds, ru.RoleID)
	}

	roles := make([]role.Role, 0)
	if len(roleIds) > 0 {
		if err := variable.Db.
			Where("id IN ?", roleIds).
			Find(&roles).
			Error; err != nil {
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mendapatkan role",
				En: "Failed to get roles",
			}, nil)
		}
	}

	divisions := make([]role.RoleDivision, 0)
	if len(roleIds) > 0 {
		if err := variable.Db.
			Where("id IN ?", roleIds).
			Find(&divisions).
			Error; err != nil {
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mendapatkan divisi",
				En: "Failed to get divisions",
			}, nil)
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
						divisionName := ""
						for _, d := range divisions {
							if d.ID == r.RoleDivisionID {
								divisionName = d.Name
								break
							}
						}
						userRoles = append(userRoles, map[string]any{
							"division_id":   fmt.Sprintf("%v", r.RoleDivisionID),
							"role_id":       fmt.Sprintf("%v", r.ID),
							"role_name":     r.Name,
							"division_name": divisionName,
						})
					}
				}
			}
		}
		user["roles"] = userRoles
		result = append(result, user)
	}

	return dto.OK(c, types.Language{
		Id: "Berhasil mendapatkan user",
		En: "Success get users",
	}, fiber.Map{
		"rows":       result,
		"pagination": pagination.Meta(),
	})
}

func Edit(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID user tidak valid",
			En: "Invalid user id",
		}, nil)
	}

	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotorisasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Avatar   string `json:"avatar"`
		Address  string `json:"address"`
		Roles    []struct {
			DivisionID string `json:"division_id"`
			RoleID     string `json:"role_id"`
		} `json:"roles"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	// Handle avatar upload
	newAvatar := body.Avatar
	if newAvatar != "" && newAvatar != "delete" {
		// Check if file exists in uploads directory
		// path usually starts with /upload/profile/filename.ext
		cleanPath := strings.TrimPrefix(newAvatar, "/upload")
		fsPath := filepath.Join(variable.UploadsPath, cleanPath)
		if _, err := os.Stat(fsPath); os.IsNotExist(err) {
			return dto.BadRequest(c, types.Language{
				Id: "File avatar tidak ditemukan di server",
				En: "Avatar file not found on server",
			}, nil)
		}
	} else if newAvatar == "delete" {
		newAvatar = ""
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan role",
			En: "Failed to get roles",
		}, nil)
	}
	if len(roles) != len(roleIds) {
		return dto.BadRequest(c, types.Language{
			Id: "ID role tidak valid",
			En: "Invalid role ids",
		}, nil)
	}

	var existing model.User
	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "User tidak ditemukan",
			En: "User not found",
		}, nil)
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
		if err := variable.Db.
			Where("username = ? AND id != ?", username, id.String()).
			First(&dup).
			Error; err == nil {
			return dto.BadRequest(c, types.Language{
				Id: "Username sudah ada",
				En: "Username already exists",
			}, nil)
		}
		updates["username"] = username
	}

	address := strings.TrimSpace(body.Address)
	if address != "" {
		updates["address"] = address
	}

	if newAvatar != existing.Avatar {
		updates["avatar"] = newAvatar
	}

	if len(updates) == 0 && len(body.Roles) == 0 {
		return dto.BadRequest(c, types.Language{
			Id: "Tidak ada data untuk diupdate",
			En: "No data to update",
		}, nil)
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
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "User dengan username tersebut sudah ada",
				En: "User with that username already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui user",
			En: "Failed to update user",
		}, nil)
	}
	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan user yang diperbarui",
			En: "Failed to fetch updated user",
		}, nil)
	}

	// Send notification to edited user
	sse.SendNotification(currentUser.ID, id, types.Notification{
		Type:    notification.NotificationTypeInfo,
		Title:   types.Language{Id: "Profil Anda diperbarui", En: "Your profile was updated"},
		Message: types.Language{Id: "Administrator telah memperbarui informasi profil Anda.", En: "An administrator has updated your profile information."},
	})

	sse.SendEventToUser(id.String(), "update-user", true)

	return dto.OK(c, types.Language{
		Id: "User berhasil diperbarui",
		En: "User updated successfully",
	}, fiber.Map{
		"user": existing.Map(),
	})
}

func Remove(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID user tidak valid",
			En: "Invalid user id",
		}, nil)
	}

	// Only SU can delete users
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotentikasi",
			En: "Unauthorized",
		}, nil)
	}
	if currentUser.Role != model.UserRoleSuperAdmin {
		return dto.Forbidden(c, types.Language{
			Id: "Hanya super admin yang bisa menghapus user",
			En: "Only super admin can delete users",
		}, nil)
	}

	// Prevent self-deletion
	if currentUser.ID.String() == id.String() {
		return dto.BadRequest(c, types.Language{
			Id: "Tidak bisa menghapus diri sendiri",
			En: "Cannot delete yourself",
		}, nil)
	}

	if err = variable.Db.
		Delete(&model.User{}, "id = ?", id.String()).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus user",
			En: "Failed to delete user",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "User berhasil dihapus",
		En: "User deleted successfully",
	}, nil)
}

func BulkRemove(c *fiber.Ctx) error {
	// Only SU can bulk delete users
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotentikasi",
			En: "Unauthorized",
		}, nil)
	}
	if currentUser.Role != model.UserRoleSuperAdmin {
		return dto.Forbidden(c, types.Language{
			Id: "Hanya super admin yang bisa menghapus user",
			En: "Only super admin can delete users",
		}, nil)
	}

	var body struct {
		IDs []string `json:"ids" validate:"required,min=1,dive,gt=0"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
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
			Where("id = ? AND role = ?", id.String(), model.UserRoleUser).
			First(&user).
			Error; err != nil {
			continue
		}
		validIDs = append(validIDs, id.String())
	}

	if len(validIDs) == 0 {
		return dto.BadRequest(c, types.Language{
			Id: "Tidak ada user yang valid untuk dihapus",
			En: "No valid users to delete",
		}, nil)
	}

	if err := variable.Db.
		Delete(&model.User{}, "id IN ?", validIDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus user",
			En: "Failed to delete user",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "User berhasil dihapus",
		En: "User deleted successfully",
	}, fiber.Map{
		"deleted_count": len(validIDs),
	})
}

func SetActive(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID user tidak valid",
			En: "Invalid user id",
		}, nil)
	}

	// Only SU can toggle active status
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotentikasi",
			En: "Unauthorized",
		}, nil)
	}
	if currentUser.Role != model.UserRoleSuperAdmin {
		return dto.Forbidden(c, types.Language{
			Id: "Hanya super admin yang bisa mengaktifkan/menonaktifkan user",
			En: "Only super admin can activate/deactivate users",
		}, nil)
	}

	var existing model.User
	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "User tidak ditemukan",
			En: "User not found",
		}, nil)
	}

	// Prevent deactivating self
	if existing.ID == currentUser.ID {
		return dto.BadRequest(c, types.Language{
			Id: "Tidak bisa menonaktifkan diri sendiri",
			En: "Cannot deactivate yourself",
		}, nil)
	}

	newStatus := !existing.IsActive
	if err := variable.Db.
		Model(&existing).
		Update("is_active", newStatus).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengaktifkan/menonaktifkan user",
			En: "Failed to activate/deactivate user",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "User berhasil diaktifkan/dinonaktifkan",
		En: "User activated/deactivated successfully",
	}, fiber.Map{
		"user": existing.Map(),
	})
}

// --- //

func ChangePasswordFromUser(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID user tidak valid",
			En: "Invalid user id",
		}, nil)
	}

	var body struct {
		Password string `json:"password" validate:"required,min=8,max=50"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var currentUser model.User
	if err := variable.Db.
		Where("id = ?", id.String()).
		First(&currentUser).
		Error; err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "ID user tidak valid",
			En: "Invalid user id",
		}, nil)
	}

	// check if password == previous password
	if !hash.ValidatePassword(body.Password, currentUser.Password) {
		return dto.BadRequest(c, types.Language{
			Id: "Password dan password sebelumnya harus berbeda",
			En: "Password and previous password must be different",
		}, nil)
	}

	if err := variable.Db.
		Model(&currentUser).
		Update("password", hash.Password(body.Password)).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengubah kata sandi user",
			En: "Failed to update user password",
		}, nil)
	}

	// Send notification to user about password change
	sse.SendNotification(currentUser.ID, id, types.Notification{
		Type:    notification.NotificationTypeWarning,
		Title:   types.Language{Id: "Kata sandi Anda diubah", En: "Your password was changed"},
		Message: types.Language{Id: "Administrator telah mengubah kata sandi akun Anda.", En: "An administrator has changed your account password."},
	})

	return dto.OK(c, types.Language{
		Id: "User berhasil diubah",
		En: "User updated successfully",
	}, fiber.Map{
		"user": currentUser.Map(),
	})
}

func RoleSwitch(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID user tidak valid",
			En: "Invalid user id",
		}, nil)
	}

	// Only SU can switch roles
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotentikasi",
			En: "Unauthorized",
		}, nil)
	}
	if currentUser.Role != model.UserRoleSuperAdmin {
		return dto.Forbidden(c, types.Language{
			Id: "Hanya super admin yang bisa mengubah peran user",
			En: "Only super admin can switch user roles",
		}, nil)
	}

	var existing model.User
	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "User tidak ditemukan",
			En: "User not found",
		}, nil)
	}

	newRole := model.UserRoleUser
	if strings.EqualFold(existing.Role, model.UserRoleUser) {
		newRole = model.UserRoleSuperAdmin
	}

	if err := variable.Db.
		Model(&existing).
		Update("role", newRole).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengubah peran user",
			En: "Failed to switch role",
		}, nil)
	}

	// Send notification to user about role change
	sse.SendNotification(currentUser.ID, id, types.Notification{
		Type:    notification.NotificationTypeSystem,
		Title:   types.Language{Id: "Peran Anda telah diubah", En: "Your role has been changed"},
		Message: types.Language{Id: "Administrator telah mengubah peran Anda menjadi " + newRole + ".", En: "An administrator has changed your role to " + newRole + "."},
	})

	return dto.OK(c, types.Language{
		Id: "Role berhasil diubah",
		En: "Role updated successfully",
	}, fiber.Map{
		"user": existing.Map(),
	})
}

func UpdateProfile(c *fiber.Ctx) error {
	existing, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Name        string `json:"name"`
		Username    string `json:"username"`
		Avatar      string `json:"avatar"`
		PhoneNumber string `json:"phone_number"`
		Address     string `json:"address"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	updates := map[string]any{}

	name := strings.TrimSpace(body.Name)
	if name != "" {
		updates["name"] = name
	}

	username := strings.TrimSpace(body.Username)
	if username != "" {
		if username != existing.Username {
			var check_user model.User
			if err := variable.Db.
				Where("username = ?", username).
				First(&check_user).
				Error; err == nil {
				return dto.BadRequest(c, types.Language{
					Id: "Username sudah ada",
					En: "Username already exists",
				}, nil)
			}
			updates["username"] = username
		}
	}

	phoneNumber := strings.TrimSpace(body.PhoneNumber)
	if phoneNumber != "" {
		updates["phone_number"] = phoneNumber
	}

	address := strings.TrimSpace(body.Address)
	if address != "" {
		updates["address"] = address
	}

	// Handle avatar upload
	newAvatar := body.Avatar
	if newAvatar != "" && newAvatar != "delete" && newAvatar != existing.Avatar {
		// Check if file exists in uploads directory
		cleanPath := strings.TrimPrefix(newAvatar, "/upload")
		fsPath := filepath.Join(variable.UploadsPath, cleanPath)
		if _, err := os.Stat(fsPath); os.IsNotExist(err) {
			return dto.BadRequest(c, types.Language{
				Id: "File avatar tidak ditemukan di server",
				En: "Avatar file not found on server",
			}, nil)
		}
		updates["avatar"] = newAvatar
	} else if newAvatar == "delete" {
		updates["avatar"] = ""
	}

	if len(updates) == 0 {
		return dto.OK(c, types.Language{
			Id: "Tidak ada perubahan",
			En: "No changes",
		}, fiber.Map{
			"user": existing.Map(),
		})
	}

	if err := variable.Db.
		Model(&existing).
		Updates(updates).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui profil user",
			En: "Failed to update user profile",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Profile berhasil diperbarui",
		En: "Profile updated successfully",
	}, fiber.Map{
		"user": existing.Map(),
	})
}
