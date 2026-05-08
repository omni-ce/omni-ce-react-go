package company

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/company/model"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func BranchCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		EntityID    uint   `json:"entity_id" validate:"required"`
		Code        string `json:"code" validate:"required"`
		Name        string `json:"name" validate:"required"`
		Alias       string `json:"alias"`
		AliasCode   string `json:"alias_code"`
		Address     string `json:"address" validate:"required"`
		AddressCode string `json:"address_code" validate:"required"`
		Phone       string `json:"phone" validate:"required"`
		Map         struct {
			Longitude float64 `json:"longitude"`
			Latitude  float64 `json:"latitude"`
		} `json:"map" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	branch := model.CompanyBranch{
		EntityID:    body.EntityID,
		Code:        body.Code,
		Name:        body.Name,
		Alias:       body.Alias,
		AliasCode:   body.AliasCode,
		Address:     body.Address,
		AddressCode: body.AddressCode,
		Phone:       body.Phone,
		Longitude:   body.Map.Longitude,
		Latitude:    body.Map.Latitude,
		IsActive:    true,
		CreatedBy:   currentUser.ID,
		UpdatedBy:   currentUser.ID,
	}

	if err := variable.Db.Create(&branch).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create branch", nil)
	}

	return dto.Created(c, "Branch created", fiber.Map{
		"branch": branch.Map(),
	})
}

func BranchPaginate(c *fiber.Ctx) error {
	branches := make([]model.CompanyBranch, 0)
	pagination, err := function.Pagination(c, &model.CompanyBranch{}, func(db *gorm.DB) *gorm.DB {
		return db.Preload("Entity")
	}, []string{"name", "code", "address"}, &branches)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	return dto.OK(c, "Success get branches", fiber.Map{
		"rows":       branches,
		"pagination": pagination.Meta(),
	})
}

func BranchEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		EntityID    uint   `json:"entity_id"`
		Code        string `json:"code"`
		Name        string `json:"name"`
		Alias       string `json:"alias"`
		AliasCode   string `json:"alias_code"`
		Address     string `json:"address"`
		AddressCode string `json:"address_code"`
		Phone       string `json:"phone"`
		Map         *struct {
			Longitude float64 `json:"longitude"`
			Latitude  float64 `json:"latitude"`
		} `json:"map"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var branch model.CompanyBranch
	if err := variable.Db.First(&branch, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, "Branch not found", nil)
	}

	updates := map[string]any{
		"updated_by": currentUser.ID,
	}

	if body.EntityID != 0 {
		updates["entity_id"] = body.EntityID
	}
	if body.Code != "" {
		updates["code"] = body.Code
	}
	if body.Name != "" {
		updates["name"] = body.Name
	}
	if body.Alias != "" {
		updates["alias"] = body.Alias
	}
	if body.AliasCode != "" {
		updates["alias_code"] = body.AliasCode
	}
	if body.Address != "" {
		updates["address"] = body.Address
	}
	if body.AddressCode != "" {
		updates["address_code"] = body.AddressCode
	}
	if body.Phone != "" {
		updates["phone"] = body.Phone
	}
	if body.Map != nil {
		updates["longitude"] = body.Map.Longitude
		updates["latitude"] = body.Map.Latitude
	}

	if err := variable.Db.Model(&branch).Updates(updates).Error; err != nil {
		return dto.InternalServerError(c, "Failed to update branch", nil)
	}

	return dto.OK(c, "Success update branch", fiber.Map{
		"branch": branch.Map(),
	})
}

func BranchRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.Delete(&model.CompanyBranch{}, "id = ?", id).Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete branch", nil)
	}

	return dto.OK(c, "Success delete branch", nil)
}

func BranchBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.Delete(&model.CompanyBranch{}, "id IN ?", body.IDs).Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete branches", nil)
	}

	return dto.OK(c, "Success bulk delete branches", fiber.Map{
		"deleted_count": len(body.IDs),
	})
}

func BranchSetActive(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var branch model.CompanyBranch
	if err := variable.Db.First(&branch, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, "Branch not found", nil)
	}

	newStatus := !branch.IsActive
	if err := variable.Db.Model(&branch).Updates(map[string]any{
		"is_active":  newStatus,
		"updated_by": currentUser.ID,
	}).Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle branch status", nil)
	}

	return dto.OK(c, "Success toggle branch status", fiber.Map{
		"branch": branch.Map(),
	})
}
