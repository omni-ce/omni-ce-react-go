package supplier

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/modules/supplier/model"
	"react-go/core/types"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func EntityCreate(c *fiber.Ctx) error {
	currentUser, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotorisasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Name      string  `json:"name" validate:"required"`
		Address   string  `json:"address" validate:"required"`
		Phone     string  `json:"phone" validate:"required"`
		Email     string  `json:"email" validate:"required,email"`
		Longitude float64 `json:"longitude"`
		Latitude  float64 `json:"latitude"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	entity := model.SupplierEntity{
		Name:      body.Name,
		Address:   body.Address,
		Phone:     body.Phone,
		Email:     body.Email,
		Longitude: body.Longitude,
		Latitude:  body.Latitude,
		IsActive:  true,
		CreatedBy: currentUser.ID,
		UpdatedBy: currentUser.ID,
	}

	if err := variable.Db.Create(&entity).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal membuat entitas supplier",
			En: "Failed to create supplier entity",
		}, nil)
	}

	return dto.Created(c, types.Language{
		Id: "Entitas supplier berhasil dibuat",
		En: "Supplier entity created successfully",
	}, fiber.Map{
		"row": entity.Map(),
	})
}

func EntityPaginate(c *fiber.Ctx) error {
	entities := make([]model.SupplierEntity, 0)
	pagination, err := function.Pagination(c, &model.SupplierEntity{}, func(db *gorm.DB) *gorm.DB {
		return db.Preload("CreatedBy").Preload("UpdatedBy")
	}, []string{"name", "address", "phone", "email"}, &entities)
	if err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengambil data",
			En: "Failed to retrieve data",
		}, nil)
	}

	rows := make([]map[string]any, 0, len(entities))
	for _, e := range entities {
		rows = append(rows, e.Map())
	}

	return dto.OK(c, types.Language{
		Id: "Data berhasil diambil",
		En: "Data retrieved successfully",
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
			Id: "Tidak terotorisasi",
			En: "Unauthorized",
		}, nil)
	}

	var body struct {
		Name      string  `json:"name" validate:"required"`
		Address   string  `json:"address" validate:"required"`
		Phone     string  `json:"phone" validate:"required"`
		Email     string  `json:"email" validate:"required,email"`
		Longitude float64 `json:"longitude"`
		Latitude  float64 `json:"latitude"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	var entity model.SupplierEntity
	if err := variable.Db.First(&entity, "id = ?", id).Error; err != nil {
		return dto.NotFound(c, types.Language{
			Id: "Entitas tidak ditemukan",
			En: "Entity not found",
		}, nil)
	}

	entity.Name = body.Name
	entity.Address = body.Address
	entity.Phone = body.Phone
	entity.Email = body.Email
	entity.Longitude = body.Longitude
	entity.Latitude = body.Latitude
	entity.UpdatedBy = currentUser.ID

	if err := variable.Db.Save(&entity).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal memperbarui entitas",
			En: "Failed to update entity",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Entitas berhasil diperbarui",
		En: "Entity updated successfully",
	}, fiber.Map{
		"row": entity.Map(),
	})
}

func EntityRemove(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := variable.Db.Delete(&model.SupplierEntity{}, "id = ?", id).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus entitas",
			En: "Failed to delete entity",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Entitas berhasil dihapus",
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

	if err := variable.Db.Delete(&model.SupplierEntity{}, "id IN ?", body.IDs).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal menghapus entitas",
			En: "Failed to delete entities",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: fmt.Sprintf("Berhasil menghapus %d entitas", len(body.IDs)),
		En: fmt.Sprintf("Successfully deleted %d entities", len(body.IDs)),
	}, nil)
}

func EntitySetActive(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		IsActive bool `json:"is_active"`
	}
	if err := function.RequestBody(c, &body); err != nil {
		return dto.BodyBadRequest(c, err)
	}

	if err := variable.Db.Model(&model.SupplierEntity{}).Where("id = ?", id).Update("is_active", body.IsActive).Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mengubah status",
			En: "Failed to change status",
		}, nil)
	}

	return dto.OK(c, types.Language{
		Id: "Status berhasil diubah",
		En: "Status changed successfully",
	}, nil)
}
