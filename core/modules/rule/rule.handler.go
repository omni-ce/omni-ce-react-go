package rule

import (
	"react-go/core/dto"
	"react-go/core/function"
	role "react-go/core/modules/role/model"
	model "react-go/core/modules/rule/model"
	"react-go/core/sse"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func Set(c *fiber.Ctx) error {
	var body struct {
		Data []struct {
			RoleID uint   `json:"role_id" validate:"required"`
			Key    string `json:"key" validate:"required"`
			Action string `json:"action" validate:"required"`
			State  *bool  `json:"state" validate:"required"`
		} `json:"data" validate:"required,gt=0,dive"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if len(body.Data) == 0 {
		return dto.BadRequest(c, types.Language{
			Id: "Data tidak ditemukan",
			En: "Data not found",
		}, nil)
	}

	roleIDs := make([]uint, 0)
	for _, item := range body.Data {
		roleIDs = append(roleIDs, item.RoleID)
	}
	roles := make([]role.Role, 0)
	if err := variable.Db.
		Find(&roles, "id IN ? AND is_active = ?", roleIDs, true).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Role tidak ditemukan",
			En: "Role not found",
		}, nil)
	}
	if len(roles) == 0 {
		return dto.BadRequest(c, types.Language{
			Id: "Role tidak aktif",
			En: "Role is not active",
		}, nil)
	}

	rows := make([]map[string]any, 0)
	for _, item := range body.Data {
		stateVal := false
		if item.State != nil {
			stateVal = *item.State
		}
		var existing model.Rule

		if err := variable.Db.
			Where("role_id = ? AND key = ? AND action = ?", item.RoleID, item.Key, item.Action).
			First(&existing).
			Error; err == nil {
			// Found, update state only
			if err := variable.Db.
				Model(&existing).
				Update("state", stateVal).
				Error; err != nil {
				return dto.InternalServerError(c, types.Language{
					Id: "Gagal memperbarui state role menu",
					En: "Failed to update role menu state",
				}, nil)
			}
			existing.State = stateVal
			rows = append(rows, existing.Map())
		} else {
			// Not found, insert new with default state true if not specified
			roleMenu := model.Rule{
				RoleID: item.RoleID,
				Key:    item.Key,
				Action: item.Action,
				State:  stateVal,
			}
			if err := variable.Db.
				Create(&roleMenu).
				Error; err != nil {
				message := err.Error()
				if strings.Contains(message, "UNIQUE constraint") {
					return dto.BadRequest(c, types.Language{
						Id: "Data sudah ada",
						En: "Data already exists",
					}, nil)
				}
				return dto.InternalServerError(c, types.Language{
					Id: "Gagal membuat role menu",
					En: "Failed to create role menu",
				}, nil)
			}
			rows = append(rows, roleMenu.Map())
		}
	}

	// Broadcast rule update to all connected frontend clients
	sse.BroadcastEvent("update-rule", true)

	return dto.OK(c, types.Language{
		Id: "Role menu berhasil diatur",
		En: "Role menus set successfully",
	}, fiber.Map{
		"rows": rows,
	})
}

func List(c *fiber.Ctx) error {
	roleMenus := make([]model.Rule, 0)
	if err := variable.Db.
		Model(&model.Rule{}).
		Find(&roleMenus).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari role menu",
			En: "Failed to find role menu",
		}, nil)
	}

	rows := make([]map[string]any, 0)
	for _, item := range roleMenus {
		rows = append(rows, item.Map())
	}
	return dto.OK(c, types.Language{
		Id: "Role menu berhasil didapatkan",
		En: "Role menus fetched successfully!",
	}, fiber.Map{
		"rows": rows,
	})
}
