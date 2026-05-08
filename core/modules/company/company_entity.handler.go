package company

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/address"
	"react-go/core/modules/company/model"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
)

func EntityCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Logo        string `json:"logo" validate:"required"`
		Name        string `json:"name" validate:"required"`
		NpwpCode    string `json:"npwp_code" validate:"required"`
		IsTaxPayer  bool   `json:"is_taxpayer"`
		NpwpAlias   string `json:"npwp_alias"`
		Address     string `json:"address" validate:"required"`
		AddressCode string `json:"address_code" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	entity := model.CompanyEntity{
		Logo:        body.Logo,
		Name:        body.Name,
		NpwpCode:    body.NpwpCode,
		IsTaxPayer:  body.IsTaxPayer,
		NpwpAlias:   body.NpwpAlias,
		Address:     body.Address,
		AddressCode: body.AddressCode,
		IsActive:    true,
		CreatedBy:   currentUser.ID,
		UpdatedBy:   currentUser.ID,
	}

	if err := variable.Db.Create(&entity).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create entity", nil)
	}

	return dto.Created(c, "Entity created", fiber.Map{
		"entity": entity.Map(),
	})
}

func EntityPaginate(c *fiber.Ctx) error {
	entities := make([]model.CompanyEntity, 0)
	pagination, err := function.Pagination(c, &model.CompanyEntity{}, nil, []string{"name", "npwp_code", "address"}, &entities)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}
	address_codes := make([]string, 0)
	for _, entity := range entities {
		address_codes = append(address_codes, entity.AddressCode)
	}

	addresses := make(map[string]string)
	for _, address_code := range address_codes {
		fullAddress, err, isBadRequest := address.GetFull(address_code)
		if err != nil {
			if isBadRequest {
				return dto.BadRequest(c, err.Error(), nil)
			}
			return dto.InternalServerError(c, err.Error(), nil)
		}
		addresses[address_code] = fullAddress
	}

	rows := make([]any, 0)
	for _, entity := range entities {
		data := entity.Map()
		data["full_address"] = addresses[entity.AddressCode]
		rows = append(rows, data)
	}

	return dto.OK(c, "Success get entities", fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func EntityEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		Logo        string `json:"logo"`
		Name        string `json:"name"`
		NpwpCode    string `json:"npwp_code"`
		IsTaxPayer  *bool  `json:"is_taxpayer"`
		NpwpAlias   string `json:"npwp_alias"`
		Address     string `json:"address"`
		AddressCode string `json:"address_code"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var entity model.CompanyEntity
	if err := variable.Db.First(&entity, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, "Entity not found", nil)
	}

	updates := map[string]any{
		"updated_by": currentUser.ID,
	}

	if body.Logo != "" {
		updates["logo"] = body.Logo
	}
	if body.Name != "" {
		updates["name"] = body.Name
	}
	if body.NpwpCode != "" {
		updates["npwp_code"] = body.NpwpCode
	}
	if body.IsTaxPayer != nil {
		updates["is_taxpayer"] = *body.IsTaxPayer
	}
	if body.NpwpAlias != "" {
		updates["npwp_alias"] = body.NpwpAlias
	}
	if body.Address != "" {
		updates["address"] = body.Address
	}
	if body.AddressCode != "" {
		updates["address_code"] = body.AddressCode
	}

	if err := variable.Db.Model(&entity).Updates(updates).Error; err != nil {
		return dto.InternalServerError(c, "Failed to update entity", nil)
	}

	return dto.OK(c, "Success update entity", fiber.Map{
		"entity": entity.Map(),
	})
}

func EntityRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.Delete(&model.CompanyEntity{}, "id = ?", id).Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete entity", nil)
	}

	return dto.OK(c, "Success delete entity", nil)
}

func EntityBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.Delete(&model.CompanyEntity{}, "id IN ?", body.IDs).Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete entities", nil)
	}

	return dto.OK(c, "Success bulk delete entities", fiber.Map{
		"deleted_count": len(body.IDs),
	})
}

func EntitySetActive(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var entity model.CompanyEntity
	if err := variable.Db.First(&entity, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, "Entity not found", nil)
	}

	newStatus := !entity.IsActive
	if err := variable.Db.Model(&entity).Updates(map[string]any{
		"is_active":  newStatus,
		"updated_by": currentUser.ID,
	}).Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle entity status", nil)
	}

	return dto.OK(c, "Success toggle entity status", fiber.Map{
		"entity": entity.Map(),
	})
}
