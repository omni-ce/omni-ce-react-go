package option

import (
	"react-go/dto"
	"react-go/types"
	"react-go/variable"
	"strconv"

	role "react-go/modules/role/model"

	"github.com/gofiber/fiber/v2"
)

func Divisions(c *fiber.Ctx) error {
	divisions := make([]role.RoleDivision, 0)
	if err := variable.Db.
		Model(&role.RoleDivision{}).
		Find(&divisions).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find divisions", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range divisions {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, "Get divisions success", rows)
}

func Roles(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid division id", nil)
	}

	roles := make([]role.Role, 0)
	if err := variable.Db.
		Model(&role.Role{}).
		Where("role_division_id = ?", id).
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find roles", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range roles {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, "Get roles success", rows)
}
