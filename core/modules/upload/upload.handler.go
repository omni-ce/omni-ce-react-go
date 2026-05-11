package upload

import (
	"fmt"
	"os"
	"path/filepath"
	"react-go/core/dto"
	"react-go/core/types"
	"react-go/core/variable"
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

func Bucket(c *fiber.Ctx) error {
	bucketName := c.Params("bucket_name")

	path, err := uploader(c, bucketName)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "Gagal mengunggah file",
			En: "Failed to upload file",
		}, err.Error())
	}

	return dto.OK(c, types.Language{
		Id: "File berhasil diunggah",
		En: "File uploaded successfully",
	}, fiber.Map{
		"path": path,
	})
}
