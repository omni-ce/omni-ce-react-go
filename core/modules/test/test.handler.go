package test

import (
	"fmt"
	"log"
	"os"
	"react-go/core/function"
	"react-go/core/variable"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
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

	// Disable foreign key checks
	if dialect == "mysql" || dialect == "tidb" {
		variable.Db.Exec("SET FOREIGN_KEY_CHECKS = 0;")
		defer variable.Db.Exec("SET FOREIGN_KEY_CHECKS = 1;")
	} else if dialect == "sqlite" {
		variable.Db.Exec("PRAGMA foreign_keys = OFF;")
		defer variable.Db.Exec("PRAGMA foreign_keys = ON;")
	} else if dialect == "postgres" {
		variable.Db.Exec("SET session_replication_role = 'replica';")
		defer variable.Db.Exec("SET session_replication_role = 'origin';")
	}

	// Get all tables to truncate
	allTables, err := variable.Db.Migrator().GetTables()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to get tables",
			"error":   err.Error(),
		})
	}

	// Order tables: use Models() in reverse order if available, then the rest
	var truncateOrder []string
	if variable.Models != nil {
		models := variable.Models()
		modelTables := make(map[string]bool)

		// Reversing model order for truncation (child to parent)
		for i := len(models) - 1; i >= 0; i-- {
			stmt := &gorm.Statement{DB: variable.Db}
			_ = stmt.Parse(models[i])
			if stmt.Schema != nil {
				truncateOrder = append(truncateOrder, stmt.Schema.Table)
				modelTables[stmt.Schema.Table] = true
			}
		}

		// Add any remaining tables found in DB but not in Models
		for _, t := range allTables {
			if !modelTables[t] && t != "sqlite_sequence" {
				truncateOrder = append(truncateOrder, t)
			}
		}
	} else {
		truncateOrder = allTables
	}

	// Execute truncation in order
	for _, table := range truncateOrder {
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

	// Seed kembali data seperti data awal
	if variable.SeedAll != nil {
		variable.SeedAll(variable.Db)
	}

	log.Println("✅ All tables truncated from Test Handler")
	return c.JSON(fiber.Map{
		"message": "OK",
	})
}
