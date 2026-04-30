package rule

import (
	"react-go/dto"
	"react-go/function"
	role "react-go/modules/role/model"
	model "react-go/modules/rule/model"
	"react-go/variable"

	"github.com/gofiber/fiber/v2"
)

func Set(c *fiber.Ctx) error {
	var req struct {
		Data []struct {
			RoleID uint   `json:"role_id" validate:"required"`
			Key    string `json:"key" validate:"required"`
			Action string `json:"action" validate:"required"`
			State  *bool  `json:"state" validate:"required,bool"`
		} `json:"data" validate:"required,gt=1,dive"`
	}
	if err := function.RequestBody(c, &req); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}
	if len(req.Data) == 0 {
		return dto.BadRequest(c, "No data provided", nil)
	}

	roleIDs := make([]uint, 0)
	for _, item := range req.Data {
		roleIDs = append(roleIDs, item.RoleID)
	}
	roles := make([]role.Role, 0)
	if err := variable.Db.
		Find(&roles, "id IN ? AND is_active = ?", roleIDs, true).
		Error; err != nil {
		return dto.NotFound(c, "Role not found", nil)
	}
	if len(roles) == 0 {
		return dto.BadRequest(c, "No active roles found", nil)
	}

	rows := make([]map[string]any, 0)
	for _, item := range req.Data {
		stateVal := true
		if item.State != nil {
			stateVal = *item.State
		}
		var existing model.Rule
		err := variable.Db.
			Where("role_id = ? AND key = ? AND action = ?", item.RoleID, item.Key, item.Action).
			First(&existing).
			Error
		if err == nil {
			// Found, update state only
			if err := variable.Db.Model(&existing).Update("state", stateVal).Error; err != nil {
				return dto.InternalServerError(c, "Failed to update role menu state", nil)
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
			if err := variable.Db.Create(&roleMenu).Error; err != nil {
				return dto.InternalServerError(c, "Failed to create role menu", nil)
			}
			rows = append(rows, roleMenu.Map())
		}
	}

	return dto.OK(c, "Role Menus set successfully", fiber.Map{
		"rows": rows,
	})
}

func List(c *fiber.Ctx) error {
	roleMenus := make([]model.Rule, 0)
	if err := variable.Db.
		Model(&model.Rule{}).
		Find(&roleMenus).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find role menus", nil)
	}

	rows := make([]map[string]any, 0)
	for _, item := range roleMenus {
		rows = append(rows, item.Map())
	}
	return dto.OK(c, "Success", fiber.Map{
		"rows": rows,
	})
}
