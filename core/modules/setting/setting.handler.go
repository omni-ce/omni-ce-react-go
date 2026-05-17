package setting

import (
	"crypto/md5"
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	setting "react-go/core/modules/setting/model"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func All(c *fiber.Ctx) error {
	settings := make([]setting.Setting, 0)
	if err := variable.Db.
		Find(&settings).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mendapatkan pengaturan",
			En: "Failed to get settings",
		}, nil)
	}

	result := make(map[string]string)
	for _, s := range settings {
		result[s.Key] = s.Value
	}

	return dto.OK(c, types.Language{
		Id: "Pengaturan berhasil didapatkan",
		En: "Settings retrieved successfully!",
	}, result)
}

func Set(c *fiber.Ctx) error {
	contentType := strings.ToLower(c.Get("Content-Type"))
	isMultipart := strings.Contains(contentType, "multipart/form-data")

	// JSON / urlencoded-like
	if !isMultipart {
		var bodies map[string]string
		if err := c.BodyParser(&bodies); err != nil {
			return dto.BadRequest(c, types.Language{
				Id: "Body request tidak valid",
				En: "Invalid request body",
			}, nil)
		}

		for key, value := range bodies {
			var s setting.Setting
			if err := variable.Db.
				Where("key = ?", key).
				First(&s).
				Error; err != nil {
				return dto.NotFound(c, types.Language{
					Id: "Pengaturan tidak ditemukan",
					En: "Setting not found",
				}, nil)
			}
			last_value := s.Value
			// fmt.Printf("Key: %s | Last Value: %s | Value: %s\n", key, last_value, fmt.Sprintf("%x", md5.Sum([]byte(value))))

			if key == "auth_password" {
				last_password := c.Get("X-Last-Password")
				if last_password != "" && fmt.Sprintf("%x", md5.Sum([]byte(last_password))) != last_value {
					return dto.BadRequest(c, types.Language{
						Id: "Password saat ini salah",
						En: "Current password is incorrect",
					}, nil)
				}
				value = fmt.Sprintf("%x", md5.Sum([]byte(value)))
			}

			s.Value = value
			variable.Db.Save(&s)
		}

		return dto.OK(c, types.Language{
			Id: "Pengaturan berhasil diperbarui",
			En: "Setting updated successfully!",
		}, nil)
	}

	// multipart/form-data
	form, err := c.MultipartForm()
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Multipart form tidak valid",
			En: "Invalid multipart form",
		}, nil)
	}

	// Handle file uploads
	uploadsPath := variable.UploadsPath
	if form.File != nil {
		for fieldname, files := range form.File {
			if len(files) == 0 {
				continue
			}
			file := files[0]

			var s setting.Setting
			if err := variable.Db.
				Where("key = ?", fieldname).
				First(&s).
				Error; err != nil {
				return dto.NotFound(c, types.Language{
					Id: "Pengaturan tidak ditemukan",
					En: "Setting not found",
				}, nil)
			}

			filename := file.Filename
			dst := uploadsPath + "/" + filename
			if err := c.SaveFile(file, dst); err != nil {
				return dto.InternalServerError(c, types.Language{
					Id: "Gagal menyimpan file",
					En: "Failed to save file",
				}, nil)
			}

			s.Value = filename
			variable.Db.Save(&s)
		}
	}

	// Handle text fields
	if form.Value != nil {
		for key, values := range form.Value {
			if len(values) == 0 {
				continue
			}
			value := values[0]

			var s setting.Setting
			if err := variable.Db.
				Where("key = ?", key).
				First(&s).
				Error; err != nil {
				return dto.NotFound(c, types.Language{
					Id: "Pengaturan tidak ditemukan",
					En: "Setting not found",
				}, nil)
			}

			if key == "auth_password" {
				value = fmt.Sprintf("%x", md5.Sum([]byte(value)))
			}

			s.Value = value
			variable.Db.Save(&s)
		}
	}

	return dto.OK(c, types.Language{
		Id: "Pengaturan berhasil diperbarui",
		En: "Setting updated successfully!",
	}, nil)
}

func ToggleMaintenance(c *fiber.Ctx) error {
	// Only su can toggle maintenance
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok || claims.Role != "su" {
		return dto.Forbidden(c, types.Language{
			Id: "Hanya super admin yang dapat mengubah mode maintenance",
			En: "Only super users can toggle maintenance mode",
		}, nil)
	}

	var s setting.Setting
	if err := variable.Db.
		Where("key = ?", "maintenance_mode").
		First(&s).
		Error; err != nil {
		// Create if not exists
		s = setting.Setting{Key: "maintenance_mode", Value: "false"}
		variable.Db.Create(&s)
	}

	if s.Value == "true" {
		s.Value = "false"
	} else {
		s.Value = "true"
	}
	variable.Db.Save(&s)

	return dto.OK(c, types.Language{
		Id: "Maintenance mode berhasil diubah",
		En: "Maintenance mode updated successfully!",
	}, fiber.Map{
		"maintenance_mode": s.Value == "true",
	})
}
