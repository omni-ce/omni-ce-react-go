package company

import (
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/function/location"
	company "react-go/core/modules/company/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func BranchCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		EntityID    string `json:"entity_id" validate:"required"`
		PicID       string `json:"pic_id" validate:"required"`
		Code        string `json:"code" validate:"required"`
		Name        string `json:"name" validate:"required"`
		Address     string `json:"address" validate:"required"`
		AddressCode string `json:"address_code" validate:"required"`
		Phone       string `json:"phone" validate:"required"`
		Map         struct {
			Longitude float64 `json:"longitude"`
			Latitude  float64 `json:"latitude"`
		} `json:"map" validate:"required"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	entityID, err := strconv.Atoi(body.EntityID)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Entity tidak valid",
			En: "Invalid entity ID",
		}, nil)
	}

	picID, err := uuid.Parse(body.PicID)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "PIC tidak valid",
			En: "Invalid PIC ID",
		}, nil)
	}

	branch := company.CompanyBranch{
		EntityID:    uint(entityID),
		PicID:       picID,
		Code:        body.Code,
		Name:        body.Name,
		Address:     body.Address,
		AddressCode: body.AddressCode,
		Phone:       body.Phone,
		Longitude:   body.Map.Longitude,
		Latitude:    body.Map.Latitude,
		IsActive:    true,
		CreatedBy:   currentUser.ID,
		UpdatedBy:   currentUser.ID,
	}

	if err := variable.Db.
		Create(&branch).
		Error; err != nil {
		message := err.Error()
		if strings.Contains(message, "UNIQUE constraint") {
			return dto.BadRequest(c, types.Language{
				Id: "Cabang perusahaan sudah ada",
				En: "Company branch already exists",
			}, nil)
		}
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat cabang perusahaan",
			En: "Failed to create company branch",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Cabang perusahaan berhasil dibuat",
		En: "Company branch created successfully",
	}, fiber.Map{
		"branch": branch.Map(),
	})
}

func BranchPaginate(c *fiber.Ctx) error {
	branches := make([]company.CompanyBranch, 0)
	pagination, err := function.Pagination(c, &company.CompanyBranch{}, func(db *gorm.DB) *gorm.DB {
		return db.Preload("Entity").Preload("Pic")
	}, []string{"name", "code", "address"}, &branches)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memuat data cabang perusahaan",
			En: "Failed to load company branches",
		}, nil)
	}

	address_codes := make([]string, 0)
	for _, branch := range branches {
		address_codes = append(address_codes, branch.AddressCode)
	}

	addresses := make(map[string]string)
	for _, address_code := range address_codes {
		fullAddress, err, isBadRequest := location.GetFull(address_code)
		if err != nil {
			if isBadRequest {
				return dto.BadRequest(c, types.Language{
					Id: "Format kode alamat tidak valid",
					En: "Invalid address code format",
				}, nil)
			}
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mengambil data alamat",
				En: "Failed to get address data",
			}, nil)
		}
		addresses[address_code] = fullAddress
	}

	rows := make([]any, 0)
	for _, row := range branches {
		branch := row.Map()
		branch["entity_name"] = row.Entity.Name
		branch["entity_logo"] = row.Entity.Logo
		branch["pic_name"] = row.Pic.Name
		branch["full_address"] = addresses[row.AddressCode]
		branch["map"] = fiber.Map{
			"longitude": row.Longitude,
			"latitude":  row.Latitude,
		}
		delete(branch, "longitude")
		delete(branch, "latitude")
		rows = append(rows, branch)
	}

	return dto.OK(c, types.Language{
		Id: "Cabang perusahaan berhasil diambil",
		En: "Company branches retrieved successfully",
	}, fiber.Map{
		"rows":       rows,
		"pagination": pagination.Meta(),
	})
}

func BranchEdit(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		EntityID    string `json:"entity_id"`
		PicID       string `json:"pic_id"`
		Code        string `json:"code"`
		Name        string `json:"name"`
		Address     string `json:"address"`
		AddressCode string `json:"address_code"`
		Phone       string `json:"phone"`
		Map         *struct {
			Longitude float64 `json:"longitude"`
			Latitude  float64 `json:"latitude"`
		} `json:"map"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var branch company.CompanyBranch
	if err := variable.Db.
		First(&branch, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Cabang perusahaan tidak ditemukan",
			En: "Company branch not found",
		}, nil)
	}

	updates := map[string]any{
		"updated_by": currentUser.ID,
	}

	if body.EntityID != "" {
		entityID, err := strconv.Atoi(body.EntityID)
		if err != nil {
			return dto.BadRequest(c, types.Language{
				Id: "Entity tidak valid",
				En: "Invalid entity ID",
			}, nil)
		}
		updates["entity_id"] = uint(entityID)
	}
	if body.PicID != "" {
		picID, err := uuid.Parse(body.PicID)
		if err != nil {
			return dto.BadRequest(c, types.Language{
				Id: "PIC tidak valid",
				En: "Invalid PIC ID",
			}, nil)
		}
		updates["pic_id"] = picID
	}
	if body.Code != "" {
		updates["code"] = body.Code
	}
	if body.Name != "" {
		updates["name"] = body.Name
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

	if err := variable.Db.
		Model(&branch).
		Updates(updates).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui cabang perusahaan",
			En: "Failed to update company branch",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Cabang perusahaan berhasil diperbarui",
		En: "Company branch updated successfully",
	}, fiber.Map{
		"branch": branch.Map(),
	})
}

func BranchRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.
		Delete(&company.CompanyBranch{}, "id = ?", id).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus cabang perusahaan",
			En: "Failed to delete company branch",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Cabang perusahaan berhasil dihapus",
		En: "Company branch deleted successfully",
	}, nil)
}

func BranchBulkRemove(c *fiber.Ctx) error {
	var body struct {
		IDs []uint `json:"ids" validate:"required,min=1"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.
		Delete(&company.CompanyBranch{}, "id IN ?", body.IDs).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus cabang perusahaan",
			En: "Failed to delete company branch",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Cabang perusahaan berhasil dihapus",
		En: "Company branch deleted successfully",
	}, fiber.Map{
		"deleted_count": len(body.IDs),
	})
}

func BranchSetActive(c *fiber.Ctx) error {
	id := c.Params("id")
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terautentikasi",
			En: "Unauthorized",
		}, nil)
	}

	var branch company.CompanyBranch
	if err := variable.Db.
		First(&branch, "id = ?", id).
		Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Cabang perusahaan tidak ditemukan",
			En: "Company branch not found",
		}, nil)
	}

	newStatus := !branch.IsActive
	if err := variable.Db.
		Model(&branch).
		Updates(map[string]any{
			"is_active":  newStatus,
			"updated_by": currentUser.ID,
		}).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengubah status cabang perusahaan",
			En: "Failed to change company branch status",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Cabang perusahaan berhasil diubah",
		En: "Company branch updated successfully",
	}, fiber.Map{
		"branch": branch.Map(),
	})
}
