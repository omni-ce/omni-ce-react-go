package auth

import (
	"fmt"
	"strings"

	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/function/hash"
	role "react-go/core/modules/role/model"
	rule "react-go/core/modules/rule/model"
	user "react-go/core/modules/user/model"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
)

func getUserMapWithRoles(user user.User) map[string]any {
	var roleUsers []role.RoleUser
	variable.Db.Where("user_id = ?", user.ID).Find(&roleUsers)
	var roleIds []uint
	for _, ru := range roleUsers {
		roleIds = append(roleIds, ru.RoleID)
	}
	var roles []role.Role
	if len(roleIds) > 0 {
		variable.Db.Where("id IN ?", roleIds).Find(&roles)
	}

	userMap := user.Map()
	userRoles := make([]map[string]any, 0)
	for _, r := range roles {
		userRoles = append(userRoles, map[string]any{
			"division_id": fmt.Sprintf("%v", r.RoleDivisionID),
			"role_id":     fmt.Sprintf("%v", r.ID),
			"role_name":   r.Name,
		})
	}
	userMap["roles"] = userRoles
	return userMap
}

func getRules(current_user user.User) ([]map[string]any, error) {
	rows := make([]map[string]any, 0)
	if current_user.Role == user.UserRoleClient {
		roleUsers := make([]role.RoleUser, 0)
		variable.Db.Where("user_id = ?", current_user.ID).Find(&roleUsers)
		roleIds := make([]uint, 0)
		for _, ru := range roleUsers {
			roleIds = append(roleIds, ru.RoleID)
		}
		// -------------------------------------- //
		rules := make([]rule.Rule, 0)
		if err := variable.Db.
			Model(&rule.Rule{}).
			Where("role_id IN ?", roleIds).
			Find(&rules).
			Error; err != nil {
			return nil, fmt.Errorf("Failed to find role menus")
		}
		for _, rule := range rules {
			rows = append(rows, rule.Map())
		}
	}
	return rows, nil
}

func Login(c *fiber.Ctx) error {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if body.Username == "" {
		return dto.BadRequest(c, "Username is required", nil)
	}
	if body.Password == "" {
		return dto.BadRequest(c, "Password is required", nil)
	}

	// Find user by username
	var current_user user.User
	if err := variable.Db.
		Where("username = ?", body.Username).
		First(&current_user).
		Error; err != nil {
		return dto.Unauthorized(c, "Invalid username or password", nil)
	}

	// Verify password
	if !hash.ValidatePassword(body.Password, current_user.Password) {
		return dto.Unauthorized(c, "Invalid username or password", nil)
	}

	token, err := function.JwtGenerateToken(function.JwtClaims{
		ID:   current_user.ID.String(),
		Role: current_user.Role,
	})
	if err != nil {
		return dto.InternalServerError(c, "Failed to generate token", nil)
	}

	rules, err := getRules(current_user)
	if err != nil {
		return dto.InternalServerError(c, err.Error(), nil)
	}

	return dto.OK(c, "Login success", fiber.Map{
		"token": token,
		"user":  getUserMapWithRoles(current_user),
		"rules": rules,
	})
}

func Logout(c *fiber.Ctx) error {
	// logic revoke
	return dto.OK(c, "Logout success", nil)
}

func Validate(c *fiber.Ctx) error {
	current_user, err := function.JwtGetUser(c)
	if err != nil {
		message := err.Error()
		if strings.Contains(message, "user not found") {
			return dto.Unauthorized(c, "user not found", nil)
		}
		return dto.InternalServerError(c, message, nil)
	}

	rules, err := getRules(current_user)
	if err != nil {
		return dto.InternalServerError(c, err.Error(), nil)
	}

	return dto.OK(c, "Token valid", fiber.Map{
		"user":  getUserMapWithRoles(current_user),
		"rules": rules,
	})
}
