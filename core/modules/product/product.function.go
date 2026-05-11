package product

import (
	"encoding/json"
	"fmt"
	"react-go/core/dto"
	"react-go/core/modules/product/model"
	"react-go/core/types"
	"react-go/core/variable"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func HelloWorld(c *fiber.Ctx) error {
	return dto.OK(c, types.Language{
		Id: "Halo dunia!",
		En: "Hello world!",
	}, nil)
}

func generateKeyFromName(inputs ...string) string {
	var parts []string
	for _, input := range inputs {
		var names map[string]string
		if err := json.Unmarshal([]byte(input), &names); err == nil {
			// Use "en" name if available, otherwise "id"
			source := names["en"]
			if source == "" {
				source = names["id"]
			}
			parts = append(parts, sanitizeKey(source))
		} else {
			parts = append(parts, sanitizeKey(input))
		}
	}

	return strings.Join(parts, "_")
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

func RegenerateItemKeysByAttribute(attribute string, id uint) {
	var items []model.ProductItem
	query := variable.Db.Model(&model.ProductItem{})
	switch attribute {
	case "category":
		query = query.Where("category_id = ?", id)
	case "type":
		query = query.Where("type_id = ?", id)
	case "brand":
		query = query.Where("brand_id = ?", id)
	case "variant":
		query = query.Where("varian_id = ?", id)
	case "memory":
		query = query.Where("memory_id = ?", id)
	case "color":
		query = query.Where("color_id = ?", id)
	case "condition":
		query = query.Where("condition_id = ?", id)
	default:
		return
	}

	query.
		Preload("Category").
		Preload("Type").
		Preload("Brand").
		Preload("Variant").
		Preload("Memory").
		Preload("Color").
		Preload("Condition").
		Find(&items)

	for _, item := range items {
		keyNames := make([]string, 0)
		if item.Category.ID != 0 {
			keyNames = append(keyNames, item.Category.Name)
		}
		if item.Type.ID != 0 {
			keyNames = append(keyNames, item.Type.Name)
		}
		if item.Brand.ID != 0 {
			keyNames = append(keyNames, item.Brand.Name)
		}
		if item.Variant.ID != 0 {
			keyNames = append(keyNames, item.Variant.Name)
		}
		if item.MemoryID != nil && item.Memory.ID != 0 {
			keyNames = append(keyNames, fmt.Sprintf("%d GB / %d GB", item.Memory.Ram, item.Memory.InternalStorage))
		}
		if item.ColorID != nil && item.Color.ID != 0 {
			keyNames = append(keyNames, item.Color.Name)
		}

		newKey := generateKeyFromName(keyNames...)
		variable.Db.Model(&item).UpdateColumn("key", newKey)
	}
}
