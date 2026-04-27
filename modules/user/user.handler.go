package user

import (
	"os"
	"path/filepath"
	"react-go/dto"
	"react-go/function"
	"react-go/function/hash"
	model "react-go/modules/user/model"
	"react-go/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func GetMe(on string) func(*fiber.Ctx) error {
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

// TODO: Management
func GetPaginate(c *fiber.Ctx) error {
	users := make([]model.User, 0)
	pagination, err := function.Pagination(c, &model.User{}, []string{"name", "email", "role"}, &users)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	result := make([]map[string]any, 0, len(users))
	for i := range users {
		result = append(result, users[i].Map())
	}

	return dto.OK(c, "Success get users", fiber.Map{
		"rows":       result,
		"pagination": pagination.Meta(),
	})
}

func GetList(c *fiber.Ctx) error {
	users := make([]model.User, 0)
	if err := variable.Db.
		Order("created_at desc").
		Find(&users).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch users", nil)
	}

	result := make([]map[string]any, 0, len(users))
	for i := range users {
		result = append(result, users[i].Map())
	}

	return dto.OK(c, "Success get users", fiber.Map{
		"users": result,
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

func Edit(on string) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		idParam := c.Params("id")
		id, err := uuid.Parse(idParam)
		if err != nil {
			return dto.BadRequest(c, "Invalid user id", nil)
		}

		updates := map[string]any{}

		name := strings.TrimSpace(c.FormValue("name"))
		if name != "" {
			updates["name"] = name
		}

		phoneNumber := strings.TrimSpace(c.FormValue("phone_number"))
		if phoneNumber != "" {
			updates["phone_number"] = phoneNumber
		}

		var existing model.User
		if err := variable.Db.
			First(&existing, "id = ?", id.String()).
			Error; err != nil {
			return dto.NotFound(c, "User not found", nil)
		}

		newFilename, err := handleAvatarUpload(c, existing.Avatar, existing.ID.String())
		if err != nil {
			return dto.InternalServerError(c, "Failed to save avatar file", nil)
		}
		if newFilename != "" {
			updates["avatar"] = newFilename
		}

		if len(updates) == 0 {
			return dto.BadRequest(c, "No profile data to update", nil)
		}

		if err := variable.Db.Model(&existing).Updates(updates).Error; err != nil {
			return dto.InternalServerError(c, "Failed to update user", nil)
		}
		if err := variable.Db.First(&existing, "id = ?", id.String()).Error; err != nil {
			return dto.InternalServerError(c, "Failed to fetch updated user", nil)
		}

		return dto.OK(c, "Success update user", fiber.Map{
			"user": existing.Map(),
		})
	}
}

func ChangePassword(on string) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		idParam := c.Params("id")
		id, err := uuid.Parse(idParam)
		if err != nil {
			return dto.BadRequest(c, "Invalid user id", nil)
		}

		type ChangePasswordRequest struct {
			PreviousPassword string `json:"previous_password"`
			Password         string `json:"password"`
		}

		var req ChangePasswordRequest
		if err := c.BodyParser(&req); err != nil {
			return dto.BadRequest(c, "Invalid request body", nil)
		}

		var existing model.User
		if err := variable.Db.
			First(&existing, "id = ?", id.String()).
			Error; err != nil {
			return dto.NotFound(c, "User not found", nil)
		}

		if err := variable.Db.
			Model(&existing).
			Update("password", hash.Password(req.Password)).
			Error; err != nil {
			return dto.InternalServerError(c, "Failed to update user", nil)
		}
		if err := variable.Db.
			First(&existing, "id = ?", id.String()).
			Error; err != nil {
			return dto.InternalServerError(c, "Failed to fetch updated user", nil)
		}

		return dto.OK(c, "Success update user", fiber.Map{
			"user": existing.Map(),
		})
	}
}

func RoleSwitch(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid user id", nil)
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

	if err := variable.Db.
		First(&existing, "id = ?", id.String()).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch updated user", nil)
	}

	return dto.OK(c, "Success switch role", fiber.Map{
		"user": existing.Map(),
	})
}

func Remove(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid user id", nil)
	}

	if err = variable.Db.
		Delete(&model.User{}, "id = ?", id.String()).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete user", nil)
	}

	return dto.OK(c, "Success delete user", nil)
}
