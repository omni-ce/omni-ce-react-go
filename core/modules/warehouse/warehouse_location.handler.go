package warehouse

import (
	"react-go/core/dto"
	"react-go/core/function"
	company "react-go/core/modules/company/model"
	user "react-go/core/modules/user/model"
	model "react-go/core/modules/warehouse/model"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ─── Location ────────────────────────────────────────────────────────────────

func LocationCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		BranchID string `json:"branch_id" validate:"required"`
		PicID    string `json:"pic_id" validate:"required"`
		Name     string `json:"name" validate:"required"`
		Map      struct {
			Longitude float64 `json:"longitude"`
			Latitude  float64 `json:"latitude"`
		} `json:"map" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	branchId, err := strconv.Atoi(body.BranchID)
	if err != nil {
		return dto.BadRequest(c, "Invalid branch ID", nil)
	}

	picId, err := uuid.Parse(body.PicID)
	if err != nil {
		return dto.BadRequest(c, "Invalid PIC ID", nil)
	}

	location := model.WarehouseLocation{
		BranchID:  uint(branchId),
		PicID:     picId,
		Name:      strings.TrimSpace(body.Name),
		Longitude: body.Map.Longitude,
		Latitude:  body.Map.Latitude,
		IsActive:  true,
		CreatedBy: currentUser.ID,
		UpdatedBy: currentUser.ID,
	}

	if err := variable.Db.Create(&location).Error; err != nil {
		return dto.InternalServerError(c, "Failed to create location", nil)
	}

	return dto.Created(c, "Location created", fiber.Map{
		"location": location.Map(),
	})
}

func LocationPaginate(c *fiber.Ctx) error {
	locations := make([]model.WarehouseLocation, 0)
	pagination, err := function.Pagination(c, &model.WarehouseLocation{}, func(query *gorm.DB) *gorm.DB {
		return query.Preload("Branch").Preload("Pic")
	}, []string{"name"}, &locations)
	if err != nil {
		return dto.InternalServerError(c, "Failed to prepare pagination", nil)
	}

	branchIds := make([]uint, 0, len(locations))
	for _, location := range locations {
		branchIds = append(branchIds, location.BranchID)
	}
	picIds := make([]uuid.UUID, 0, len(locations))
	for _, location := range locations {
		picIds = append(picIds, location.PicID)
	}

	branches := make([]company.CompanyBranch, 0)
	pics := make([]user.User, 0)
	variable.Db.Where("id IN ?", branchIds).Find(&branches)
	variable.Db.Where("id IN ?", picIds).Find(&pics)

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
		var pic user.User
		for _, row := range pics {
			if row.ID == locations[i].PicID {
				pic = row
				break
			}
		}
		loc["branch_name"] = branch.Name
		loc["pic_name"] = pic.Name
		loc["map"] = map[string]any{
			"latitude":  locations[i].Latitude,
			"longitude": locations[i].Longitude,
		}
		result = append(result, loc)
	}

	return dto.OK(c, "Success get locations", fiber.Map{
		"rows":       result,
		"pagination": pagination.Meta(),
	})
}

func LocationEdit(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, "Unauthorized", nil)
	}

	var body struct {
		BranchID string `json:"branch_id"`
		PicID    string `json:"pic_id"`
		Name     string `json:"name"`
		Map      struct {
			Longitude float64 `json:"longitude"`
			Latitude  float64 `json:"latitude"`
		} `json:"map" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	var existing model.WarehouseLocation
	if err := variable.Db.First(&existing, id).Error; err != nil {
		return dto.NotFound(c, "Location not found", nil)
	}

	updates := map[string]any{
		"updated_by": currentUser.ID,
	}

	if body.BranchID != "" {
		branchId, _ := strconv.Atoi(body.BranchID)
		updates["branch_id"] = uint(branchId)
	}
	if body.PicID != "" {
		picId, _ := uuid.Parse(body.PicID)
		updates["pic_id"] = picId
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

	if err := variable.Db.Model(&existing).Updates(updates).Error; err != nil {
		return dto.InternalServerError(c, "Failed to update location", nil)
	}

	return dto.OK(c, "Success update location", fiber.Map{
		"location": existing.Map(),
	})
}

func LocationRemove(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	if err := variable.Db.Delete(&model.WarehouseLocation{}, id).Error; err != nil {
		return dto.InternalServerError(c, "Failed to delete location", nil)
	}

	return dto.OK(c, "Success delete location", nil)
}

func LocationBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BadRequest(c, err.Error(), nil)
	}

	if err := variable.Db.Delete(&model.WarehouseLocation{}, "id IN ?", body.IDs).Error; err != nil {
		return dto.InternalServerError(c, "Failed to bulk delete locations", nil)
	}

	return dto.OK(c, "Success bulk delete locations", fiber.Map{
		"deleted_count": len(body.IDs),
	})
}

func LocationSetActive(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, _ := strconv.Atoi(idParam)

	var existing model.WarehouseLocation
	if err := variable.Db.First(&existing, id).Error; err != nil {
		return dto.NotFound(c, "Location not found", nil)
	}

	newStatus := !existing.IsActive
	if err := variable.Db.Model(&existing).Update("is_active", newStatus).Error; err != nil {
		return dto.InternalServerError(c, "Failed to toggle location status", nil)
	}

	return dto.OK(c, "Success toggle location status", fiber.Map{
		"location": existing.Map(),
	})
}
