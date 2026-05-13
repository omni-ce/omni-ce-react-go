package test

import (
	"github.com/gofiber/fiber/v2"
)

func CodeRefresh(c *fiber.Ctx) error {
	// generate random string 16 character with timestamp
	// save on app_back_code.txt
	return c.JSON(fiber.Map{
		"message": "OK",
	})
}

func ApocalypseTables(c *fiber.Ctx) error {
	// check apakah kode dari body di compare dengan app_back_code.txt
	// jika cocok maka delete semua data / truncate di semua data di table
	// Seed kembali data seperti data awal
	return c.JSON(fiber.Map{
		"message": "OK",
	})
}
