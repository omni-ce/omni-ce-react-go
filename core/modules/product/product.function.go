package product

import (
	"encoding/json"
	"react-go/core/dto"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func HelloWorld(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}

// Helper to generate key from multi-language name
func generateKeyFromName(nameJSON string) string {
	var names map[string]string
	if err := json.Unmarshal([]byte(nameJSON), &names); err != nil {
		// Fallback if not JSON
		return sanitizeKey(nameJSON)
	}

	// Use "en" name if available, otherwise "id"
	source := names["en"]
	if source == "" {
		source = names["id"]
	}

	return sanitizeKey(source)
}

func sanitizeKey(s string) string {
	s = strings.ToLower(s)
	// Replace non-alphanumeric (except spaces) with nothing
	reg := regexp.MustCompile("[^a-z0-9\\s]+")
	s = reg.ReplaceAllString(s, "")
	// Replace spaces with "-"
	s = strings.ReplaceAll(s, " ", "-")
	// Replace multiple dashes with single dash
	regDash := regexp.MustCompile("-+")
	s = regDash.ReplaceAllString(s, "-")
	// Trim dashes from start/end
	s = strings.Trim(s, "-")
	return s
}
