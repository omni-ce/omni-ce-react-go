package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"mime"
	"os"
	"path/filepath"
	"react-go/core/database"
	"react-go/core/dto"
	"react-go/core/modules"
	"react-go/core/sse"
	"react-go/core/types"
	"react-go/core/variable"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

//go:embed dist/*
var embedDist embed.FS

func replaceHTMLHeadTitle(data []byte) []byte {
	if len(data) == 0 {
		return data
	}
	s := string(data)
	s = strings.ReplaceAll(s, "html-head-title", variable.AppHtmlHeadTitle)
	s = strings.ReplaceAll(s, "html-head-description", variable.AppHtmlHeadDescription)
	return []byte(s)
}

func main() {
	// Initialize database
	database.OpenDB()

	// Setup workers
	go func() {
		modules.SetupWorkers()
	}()

	// Ensure uploads directory exists
	os.MkdirAll(variable.UploadsPath, 0755)

	sse.Init()

	app := fiber.New(fiber.Config{
		AppName:       variable.ServerName,
		ServerHeader:  variable.ServerName,
		StrictRouting: true,
		CaseSensitive: true,
		BodyLimit:     1024 * 1024 * 10, // MB
		Concurrency:   256 * 1024,
	})

	app.Use(cors.New())
	app.Use(helmet.New())
	app.Use(func(c *fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Panic recovered: %v", r)
				c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"status": "error",
					"error":  fmt.Sprintf("%v", r),
				})
			}
		}()
		return c.Next()
	})

	// Serve embedded frontend (SPA)
	distFS, _ := fs.Sub(embedDist, "dist")
	app.Use(func(c *fiber.Ctx) error {
		path := c.Path()
		// skip API and backend routes
		skips := []string{"/api/", "/queue", "/subscribe", "/icon", "/file", "/upload", "/ws", "/webhook"}
		for _, skip := range skips {
			if strings.HasPrefix(path, skip) {
				return c.Next()
			}
		}
		// try to serve the exact file
		filePath := strings.TrimPrefix(path, "/")
		if filePath == "" || filePath == "/" {
			filePath = "index.html"
		}
		data, err := fs.ReadFile(distFS, filePath)
		if err != nil {
			// SPA fallback: serve index.html for unknown routes
			data, err = fs.ReadFile(distFS, "index.html")
			if err != nil {
				return fiber.ErrNotFound
			}
			c.Set("Content-Type", "text/html; charset=utf-8")
			return c.Send(replaceHTMLHeadTitle(data))
		}
		// set content type based on extension
		ext := filepath.Ext(filePath)
		if ct := mime.TypeByExtension(ext); ct != "" {
			c.Set("Content-Type", ct)
		}
		if ext == ".html" {
			data = replaceHTMLHeadTitle(data)
		}
		return c.Send(data)
	})
	app.Use(logger.New()) // biarkan disini ...

	// Serve uploaded files with Cross-Origin-Resource-Policy header
	app.Use("/upload", func(c *fiber.Ctx) error {
		c.Set("Cross-Origin-Resource-Policy", "cross-origin")
		return c.Next()
	})
	app.Static("/upload", variable.UploadsPath)

	modules.SetupRoutes(app, app.Group("/api"))

	// Catch-all "joke" routes (matching Express behavior)
	jokeRoutes := []string{"/api/route", "/_next", "/_next/server", "/app"}
	for _, route := range jokeRoutes {
		app.Use(route, func(c *fiber.Ctx) error {
			return c.JSON(fiber.Map{"status": "BASTARD", "message": "You are a bastard!"})
		})
	}

	// Global error handler for API
	app.Use(func(c *fiber.Ctx) error {
		return dto.NotFound(c, types.Language{
			Id: "Endpoint tidak ditemukan",
			En: "Endpoint not found",
		}, nil)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatal(app.Listen(":" + port))
}
