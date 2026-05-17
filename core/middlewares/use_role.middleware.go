package middlewares

import (
	"react-go/core/dto"
	"react-go/core/function"
	user "react-go/core/modules/user/model"
	"react-go/core/types"

	"github.com/gofiber/fiber/v2"
)

func UseOnlyAdmin(c *fiber.Ctx) error {
	_, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok {
		return dto.Forbidden(c, types.Language{
			Id: "Silahkan set jwt middleware sebelum menggunakan role middleware",
			En: "Please set jwt middleware before use role middleware",
		}, nil)
	}

	// Only SU can toggle active status
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}
	if currentUser.Role != user.UserRoleSuperAdmin {
		return dto.Forbidden(c, types.Language{
			Id: "Anda tidak memiliki izin",
			En: "You don't have permission",
		}, nil)
	}

	c.Locals(string("user"), currentUser)
	return c.Next()
}

func UseRoleMenu(module string, action string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		_, ok := c.Locals("claims").(*function.JwtClaims)
		if !ok {
			return dto.Forbidden(c, types.Language{
				Id: "Silahkan set jwt middleware sebelum menggunakan role middleware",
				En: "Please set jwt middleware before use role middleware",
			}, nil)
		}

		return c.Next()
	}
}

func UseRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		_, ok := c.Locals("claims").(*function.JwtClaims)
		if !ok {
			return dto.Forbidden(c, types.Language{
				Id: "Silahkan set jwt middleware sebelum menggunakan role middleware",
				En: "Please set jwt middleware before use role middleware",
			}, nil)
		}

		return c.Next()
	}
}
