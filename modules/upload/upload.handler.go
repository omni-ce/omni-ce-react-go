package upload

import (
	"fmt"
	"os"
	"path/filepath"
	"react-go/dto"
	"react-go/variable"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func uploader(c *fiber.Ctx, base string) (string, error) {
	file, err := c.FormFile("file")
	if err != nil {
		return "", err
	}

	dirPath := filepath.Join(variable.UploadsPath, base)

	if err := os.MkdirAll(dirPath, 0755); err != nil {
		return "", err
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	uniqueId, _ := uuid.NewV7()
	timestamp := time.Now().UnixMilli()
	filename := fmt.Sprintf("%s_%d%s", strings.ReplaceAll(uniqueId.String(), "-", ""), timestamp, ext)

	savePath := filepath.Join(dirPath, filename)
	if err := c.SaveFile(file, savePath); err != nil {
		return "", err
	}

	// Return public URL path
	return fmt.Sprintf("/upload/%s/%s", base, filename), nil
}

func Profile(c *fiber.Ctx) error {
	path, err := uploader(c, "profile")
	if err != nil {
		return dto.BadRequest(c, "Failed to upload file", err.Error())
	}
	return dto.OK(c, "Success upload file", fiber.Map{
		"path": path,
	})
}

func BrandLogo(c *fiber.Ctx) error {
	path, err := uploader(c, "brand-logo")
	if err != nil {
		return dto.BadRequest(c, "Failed to upload file", err.Error())
	}
	return dto.OK(c, "Success upload file", fiber.Map{
		"path": path,
	})
}

func Product(c *fiber.Ctx) error {
	path, err := uploader(c, "product")
	if err != nil {
		return dto.BadRequest(c, "Failed to upload file", err.Error())
	}
	return dto.OK(c, "Success upload file", fiber.Map{
		"path": path,
	})
}
