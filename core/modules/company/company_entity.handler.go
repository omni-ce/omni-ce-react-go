package company

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/function/location"
	company "react-go/core/modules/company/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func EntityCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
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
		return dto.BodyBadRequest(c, err)
	}

	entity := company.CompanyEntity{
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

	if err := variable.Db.
		Create(&entity).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Entity perusahaan sudah ada",
				En: "Company entity already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat entity perusahaan",
			En: "Failed to create company entity",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Entity perusahaan berhasil dibuat",
		En: "Company entity created successfully",
	}, fiber.Map{
		"entity": entity.Map(),
	})
}

func EntityPaginate(c *fiber.Ctx) error {
	entities := make([]company.CompanyEntity, 0)
	pagination, err := function.Pagination(c, &company.CompanyEntity{}, nil, []string{"name", "npwp_code", "address"}, &entities)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat paginasi",
			En: "Failed to prepare pagination",
		}, nil)
	}
	address_codes := make([]string, 0)
	for _, entity := range entities {
		address_codes = append(address_codes, entity.AddressCode)
	}

	addresses := make(map[string]string)
	for _, address_code := range address_codes {
		fullAddress, err, isBadRequest := location.GetFull(address_code)
		if err != nil {
			if isBadRequest {
				return dto.BadRequest(c, types.Language{
					Id: "Code alamat tidak valid",
					En: "Invalid address code",
				}, nil)
			}
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mendapatkan alamat",
				En: "Failed to get address",
			}, nil)
		}
		addresses[address_code] = fullAddress
	}

	rows := make([]any, 0)
	for _, entity := range entities {
		data := entity.Map()
		data["full_address"] = addresses[entity.AddressCode]
		rows = append(rows, data)
	}

	return dto.OK(c, types.Language{
		Id: "Entity perusahaan berhasil diambil",
		En: "Company entity retrieved successfully",
	}, fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func EntityEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
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
		return dto.BodyBadRequest(c, err)
	}

	var entity company.CompanyEntity
	if err := variable.Db.
		First(&entity, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Entity tidak ditemukan",
			En: "Entity not found",
		}, nil)
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

	if err := variable.Db.
		Model(&entity).
		Updates(updates).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui entity",
			En: "Failed to update entity",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Entity berhasil diperbarui",
		En: "Entity updated successfully",
	}, fiber.Map{
		"entity": entity.Map(),
	})
}

func EntityRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&company.CompanyEntity{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus entity",
			En: "Failed to delete entity",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Entity berhasil dihapus",
		En: "Entity deleted successfully",
	}, nil)
}

func EntityBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.
		Delete(&company.CompanyEntity{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus entity",
			En: "Failed to delete entity",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Entity berhasil dihapus",
		En: "Entity deleted successfully",
	}, fiber.Map{
		"deleted_count": len(body.IDs),
	})
}

func EntitySetActive(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var entity company.CompanyEntity
	if err := variable.Db.
		First(&entity, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Entity tidak ditemukan",
			En: "Entity not found",
		}, nil)
	}

	newStatus := !entity.IsActive
	if err := variable.Db.
		Model(&entity).
		Updates(map[string]any{
			"is_active":  newStatus,
			"updated_by": currentUser.ID,
		}).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengubah status entity",
			En: "Failed to toggle entity status",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Entity berhasil diubah",
		En: "Entity updated successfully",
	}, fiber.Map{
		"entity": entity.Map(),
	})
}
