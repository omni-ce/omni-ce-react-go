package product

import (
	"react-go/core/dto"
	"react-go/core/modules/product/model"
	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
)

func CatalogInfiniteScroll(c *fiber.Ctx) error {
	categories := make([]model.ProductCategory, 0)
	if err := variable.Db.
		Where("`is_active` = ?", true).
		Find(&categories).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to get categories", nil)
	}

	types := make([]model.ProductType, 0)
	if c.Query("category_id") != "" {
		if err := variable.Db.
			Where("`is_active` = ?", true).
			Where("`category_id` = ?", c.Query("category_id")).
			Find(&types).
			Error; err != nil {
			return dto.InternalServerError(c, "Failed to get types", nil)
		}
	}

	rows := make([]map[string]any, 0, len(categories))
	for _, cat := range categories {
		rows = append(rows, cat.Map())
	}

	return dto.OK(c, "Success get categories", fiber.Map{
		"categories": categories,
		"types":      types,
		"rows":       rows,
	})
}
