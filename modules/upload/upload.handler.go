package upload

import (
	"os"
	"path/filepath"
	"react-go/dto"

	"github.com/gofiber/fiber/v2"
)

func uploader(c *fiber.Ctx, base string) {
	// pwd
	pwd, _ := os.Getwd()

	// path join upload
	filePath := filepath.Join(pwd, "uploads", base)

	// check if not exist, create dir
	os.MkdirAll(filePath, 0755)

	// save file
	c.SaveFile()
}

func Profile(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}
