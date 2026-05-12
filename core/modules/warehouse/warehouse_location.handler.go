package warehouse

import (
	"react-go/core/dto"
	"react-go/core/function"
	company "react-go/core/modules/company/model"
	role "react-go/core/modules/role/model"
	model "react-go/core/modules/warehouse/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ─── Location ────────────────────────────────────────────────────────────────

func LocationCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		BranchID string `json:"branch_id" validate:"required"`
		RoleID   string `json:"role_id" validate:"required"`
		Name     string `json:"name" validate:"required"`
		Map      struct {
			Longitude float64 `json:"longitude"`
			Latitude  float64 `json:"latitude"`
		} `json:"map" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	branchId, err := strconv.Atoi(body.BranchID)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID cabang tidak valid",
			En: "Invalid branch ID",
		}, nil)
	}

	roleID, err := strconv.Atoi(body.RoleID)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID Role tidak valid",
			En: "Invalid Role ID",
		}, nil)
	}

	location := model.WarehouseLocation{
		BranchID:  uint(branchId),
		RoleID:    uint(roleID),
		Name:      strings.TrimSpace(body.Name),
		Longitude: body.Map.Longitude,
		Latitude:  body.Map.Latitude,
		IsActive:  true,
		CreatedBy: currentUser.ID,
		UpdatedBy: currentUser.ID,
	}

	if err := variable.Db.
		Create(&location).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Lokasi dengan nama ini sudah ada",
				En: "Location with that name already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat lokasi",
			En: "Failed to create location",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Lokasi berhasil dibuat",
		En: "Location created successfully",
	}, fiber.Map{
		"location": location.Map(),
	})
}

func LocationPaginate(c *fiber.Ctx) error {
	locations := make([]model.WarehouseLocation, 0)
	pagination, err := function.Pagination(c, &model.WarehouseLocation{}, func(query *gorm.DB) *gorm.DB {
		return query.Preload("Branch").Preload("Role")
	}, []string{"name"}, &locations)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memvalidasi pagination",
			En: "Failed to validate pagination",
		}, nil)
	}

	branchIds := make([]uint, 0, len(locations))
	for _, location := range locations {
		branchIds = append(branchIds, location.BranchID)
	}
	roleIds := make([]uint, 0, len(locations))
	for _, location := range locations {
		roleIds = append(roleIds, location.RoleID)
	}

	branches := make([]company.CompanyBranch, 0)
	roles := make([]role.Role, 0)
	if len(branchIds) > 0 {
		variable.Db.Where("id IN ?", branchIds).Find(&branches)
	}
	if len(roleIds) > 0 {
		variable.Db.Where("id IN ?", roleIds).Find(&roles)
	}
	divisionIds := make([]uint, 0)
	for _, role := range roles {
		divisionIds = append(divisionIds, role.RoleDivisionID)
	}
	divisions := make([]role.RoleDivision, 0)
	if len(divisionIds) > 0 {
		variable.Db.Where("id IN ?", divisionIds).Find(&divisions)
	}

	entityIds := make([]uint, 0)
	for _, v := range branches {
		entityIds = append(entityIds, v.EntityID)
	}
	entities := make([]company.CompanyEntity, 0)
	variable.Db.Where("id IN ?", entityIds).Find(&entities)

	result := make([]map[string]any, 0, len(locations))
	for i := range locations {
		loc := locations[i].Map()
		var branch company.CompanyBranch
		for _, row := range branches {
			if row.ID == locations[i].BranchID {
				branch = row
				break
			}
		}
		var entity company.CompanyEntity
		for _, row := range entities {
			if row.ID == branch.EntityID {
				entity = row
				break
			}
		}
		var _role role.Role
		for _, row := range roles {
			if row.ID == locations[i].RoleID {
				_role = row
				break
			}
		}
		var division role.RoleDivision
		for _, row := range divisions {
			if row.ID == _role.RoleDivisionID {
				division = row
				break
			}
		}
		loc["entity_id"] = entity.ID
		loc["entity_name"] = entity.Name
		loc["entity_logo"] = entity.Logo
		loc["branch_id"] = branch.ID
		loc["branch_name"] = branch.Name
		loc["role_id"] = _role.ID
		loc["role_name"] = _role.Name
		loc["division_id"] = division.ID
		loc["division_name"] = division.Name
		loc["map"] = map[string]any{
			"latitude":  locations[i].Latitude,
			"longitude": locations[i].Longitude,
		}
		result = append(result, loc)
	}

	return dto.OK(c, types.Language{
		Id: "Lokasi berhasil didapatkan",
		En: "Location retrieved successfully!",
	}, fiber.Map{
		"rows":       result,
		"pagination": pagination.Meta(),
	})
}

func LocationEdit(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		BranchID string `json:"branch_id"`
		RoleID   string `json:"role_id"`
		Name     string `json:"name"`
		Map      struct {
			Longitude float64 `json:"longitude"`
			Latitude  float64 `json:"latitude"`
		} `json:"map" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var existing model.WarehouseLocation
	if err := variable.Db.
		First(&existing, id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Lokasi tidak ditemukan",
			En: "Location not found",
		}, nil)
	}

	updates := map[string]any{
		"updated_by": currentUser.ID,
	}

	if body.BranchID != "" {
		branchId, _ := strconv.Atoi(body.BranchID)
		updates["branch_id"] = uint(branchId)
	}
	if body.RoleID != "" {
		roleId, _ := strconv.Atoi(body.RoleID)
		updates["role_id"] = uint(roleId)
	}
	name := strings.TrimSpace(body.Name)
	if name != "" {
		updates["name"] = name
	}
	if body.Map.Longitude != 0 {
		updates["longitude"] = body.Map.Longitude
	}
	if body.Map.Latitude != 0 {
		updates["latitude"] = body.Map.Latitude
	}

	if err := variable.Db.
		Model(&existing).
		Updates(updates).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengupdate lokasi",
			En: "Failed to update location",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Lokasi berhasil diupdate",
		En: "Location updated successfully!",
	}, fiber.Map{
		"location": existing.Map(),
	})
}

func LocationRemove(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	if err := variable.Db.
		Delete(&model.WarehouseLocation{}, id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus lokasi",
			En: "Failed to delete location",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Lokasi berhasil dihapus",
		En: "Location deleted successfully!",
	}, nil)
}

func LocationBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.
		Delete(&model.WarehouseLocation{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus lokasi",
			En: "Failed to delete location",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Lokasi berhasil dihapus",
		En: "Location deleted successfully!",
	}, fiber.Map{
		"deleted_count": len(body.IDs),
	})
}

func LocationSetActive(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	var existing model.WarehouseLocation
	if err := variable.Db.
		First(&existing, id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Lokasi tidak ditemukan",
			En: "Location not found",
		}, nil)
	}

	newStatus := !existing.IsActive
	if err := variable.Db.
		Model(&existing).
		Update("is_active", newStatus).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengupdate lokasi",
			En: "Failed to update location",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Lokasi berhasil diupdate",
		En: "Location updated successfully!",
	}, fiber.Map{
		"location": existing.Map(),
	})
}
