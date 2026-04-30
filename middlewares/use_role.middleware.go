package middlewares

import (
	"react-go/dto"
	"react-go/function"
	user "react-go/modules/user/model"

	"github.com/gofiber/fiber/v2"
)

func UseOnlyAdmin(c *fiber.Ctx) error {
	_, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Forbidden(c, "Please set jwt middleware before use role middleware", nil)
	}

	// Only SU can toggle active status
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}
	if currentUser.Role != user.UserRoleAdmin {
		return dto.Forbidden(c, "Only super admin can toggle user status", nil)
	}

	return c.Next()
}

func UseRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.Next()
	}
}
