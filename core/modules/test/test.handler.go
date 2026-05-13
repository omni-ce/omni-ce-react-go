package test

import (
	"fmt"
	"os"
	"react-go/core/function"
	"react-go/core/variable"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

func CodeRefresh(c *fiber.Ctx) error {
	// generate random string 16 character with timestamp
	randomStr := function.GenerateRandomString(16)
	timestamp := time.Now().Format("20060102150405")
	code := fmt.Sprintf("%s_%s", randomStr, timestamp)

	// save on app_back_code.txt
	err := os.WriteFile("app_back_code.txt", []byte(code), 0644)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to save code",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "OK",
		"code":    code,
	})
}

func ApocalypseTables(c *fiber.Ctx) error {
	// check apakah kode dari body di compare dengan app_back_code.txt
	var body struct {
		Code string `json:"code"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	savedCode, err := os.ReadFile("app_back_code.txt")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to read security code",
		})
	}

	if body.Code != strings.TrimSpace(string(savedCode)) {
		return c.Status(401).JSON(fiber.Map{
			"message": "Invalid security code",
		})
	}

	// jika cocok maka delete semua data / truncate di semua data di table
	if variable.Db == nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Database connection not found",
		})
	}

	dialect := variable.Db.Dialector.Name()
	tables, err := variable.Db.Migrator().GetTables()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to get tables",
			"error":   err.Error(),
		})
	}

	if dialect == "mysql" || dialect == "tidb" {
		variable.Db.Exec("SET FOREIGN_KEY_CHECKS = 0;")
	}

	for _, table := range tables {
		switch dialect {
		case "sqlite":
			variable.Db.Exec(fmt.Sprintf("DELETE FROM %s", table))
			variable.Db.Exec(fmt.Sprintf("DELETE FROM sqlite_sequence WHERE name='%s'", table))
		case "postgres":
			variable.Db.Exec(fmt.Sprintf("TRUNCATE TABLE %s RESTART IDENTITY CASCADE", table))
		default:
			variable.Db.Exec(fmt.Sprintf("TRUNCATE TABLE %s", table))
		}
	}

	if dialect == "mysql" || dialect == "tidb" {
		variable.Db.Exec("SET FOREIGN_KEY_CHECKS = 1;")
	}

	// Seed kembali data seperti data awal
	if variable.SeedAll != nil {
		variable.SeedAll(variable.Db)
	}

	return c.JSON(fiber.Map{
		"message": "OK",
	})
}
