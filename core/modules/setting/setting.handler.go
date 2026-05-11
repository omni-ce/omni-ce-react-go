package setting

import (
	"crypto/md5"
	"fmt"
	"react-go/core/dto"
	"react-go/core/function"
	model "react-go/core/modules/setting/model"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func All(c *fiber.Ctx) error {
	settings := make([]model.Setting, 0)
	if err := variable.Db.
		Find(&settings).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to get settings", nil)
	}

	result := make(map[string]string)
	for _, s := range settings {
		result[s.Key] = s.Value
	}

	return dto.OK(c, "Settings retrieved successfully!", result)
}

func Set(c *fiber.Ctx) error {
	contentType := strings.ToLower(c.Get("Content-Type"))
	isMultipart := strings.Contains(contentType, "multipart/form-data")

	// JSON / urlencoded-like
	if !isMultipart {
		var bodies map[string]string
		if err := c.BodyParser(&bodies); err != nil {
			return dto.BadRequest(c, "Invalid request body", nil)
		}

		for key, value := range bodies {
			var s model.Setting
			if err := variable.Db.
				Where("key = ?", key).
				First(&s).
				Error; err != nil {
				return dto.NotFound(c, fmt.Sprintf("Setting not found: %s", key), nil)
			}
			last_value := s.Value
			// fmt.Printf("Key: %s | Last Value: %s | Value: %s\n", key, last_value, fmt.Sprintf("%x", md5.Sum([]byte(value))))

			if key == "auth_password" {
				last_password := c.Get("X-Last-Password")
				if last_password != "" && fmt.Sprintf("%x", md5.Sum([]byte(last_password))) != last_value {
					return dto.BadRequest(c, "Current password is incorrect", nil)
				}
				value = fmt.Sprintf("%x", md5.Sum([]byte(value)))
			}

			s.Value = value
			variable.Db.Save(&s)
		}

		return dto.OK(c, "Setting updated successfully!", nil)
	}

	// multipart/form-data
	form, err := c.MultipartForm()
	if err != nil {
		return dto.BadRequest(c, "Invalid multipart form", nil)
	}

	// Handle file uploads
	uploadsPath := variable.UploadsPath
	if form.File != nil {
		for fieldname, files := range form.File {
			if len(files) == 0 {
				continue
			}
			file := files[0]

			var s model.Setting
			if err := variable.Db.
				Where("key = ?", fieldname).
				First(&s).
				Error; err != nil {
				return dto.NotFound(c, fmt.Sprintf("Setting not found: %s", fieldname), nil)
			}

			filename := file.Filename
			dst := uploadsPath + "/" + filename
			if err := c.SaveFile(file, dst); err != nil {
				return dto.InternalServerError(c, "Failed to save file", nil)
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

			var s model.Setting
			if err := variable.Db.
				Where("key = ?", key).
				First(&s).
				Error; err != nil {
				return dto.NotFound(c, fmt.Sprintf("Setting not found: %s", key), nil)
			}

			if key == "auth_password" {
				value = fmt.Sprintf("%x", md5.Sum([]byte(value)))
			}

			s.Value = value
			variable.Db.Save(&s)
		}
	}

	return dto.OK(c, "Setting updated successfully!", nil)
}

func ToggleMaintenance(c *fiber.Ctx) error {
	// Only su can toggle maintenance
	claims, ok := c.Locals("claims").(*function.JwtClaims)
	if !ok || claims.Role != "su" {
		return dto.Forbidden(c, "Only super users can toggle maintenance mode", nil)
	}

	var s model.Setting
	if err := variable.Db.
		Where("key = ?", "maintenance_mode").
		First(&s).
		Error; err != nil {
		// Create if not exists
		s = model.Setting{Key: "maintenance_mode", Value: "false"}
		variable.Db.Create(&s)
	}

	if s.Value == "true" {
		s.Value = "false"
	} else {
		s.Value = "true"
	}
	variable.Db.Save(&s)

	return dto.OK(c, "Maintenance mode updated", fiber.Map{
		"maintenance_mode": s.Value == "true",
	})
}
