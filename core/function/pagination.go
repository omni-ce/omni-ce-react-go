package function

import (
	"fmt"
	"math"
	"strings"

	"react-go/core/variable"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PaginationResult struct {
	Page      int
	Limit     int
	Total     int64
	TotalPage int
	SortBy    string
	SortOrder string
}

func (p *PaginationResult) Meta() fiber.Map {
	return fiber.Map{
		"page":        p.Page,
		"limit":       p.Limit,
		"total":       p.Total,
		"total_pages": p.TotalPage,
		"sort_by":     p.SortBy,
		"sort_order":  p.SortOrder,
	}
}

func Pagination(c *fiber.Ctx, model interface{}, callback func(*gorm.DB) *gorm.DB, search []string, destination interface{}) (*PaginationResult, error) {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	keyword := strings.TrimSpace(c.Query("search", ""))
	searchFieldsQuery := strings.TrimSpace(c.Query("search_fields", ""))
	sortBy := strings.TrimSpace(c.Query("sort_by", "id"))
	sortOrder := strings.ToUpper(strings.TrimSpace(c.Query("sort_order", "ASC")))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if sortOrder != "ASC" && sortOrder != "DESC" {
		sortOrder = "ASC"
	}

	columnMap := getModelColumnMap(model)
	effectiveSearch := filterSearchFields(search, searchFieldsQuery, columnMap)

	tableName := ""
	stmt := &gorm.Statement{DB: variable.Db}
	if err := stmt.Parse(model); err == nil && stmt.Schema != nil {
		tableName = stmt.Schema.Table
	}

	query := variable.Db.Model(model)
	if keyword != "" && len(effectiveSearch) > 0 {
		lowerKeyword := "%" + strings.ToLower(keyword) + "%"
		conditions := make([]string, 0, len(effectiveSearch))
		args := make([]interface{}, 0, len(effectiveSearch))

		for _, field := range effectiveSearch {
			field = normalizeColumnName(field, columnMap)
			if field == "" {
				continue
			}

			columnSelector := field
			if tableName != "" {
				columnSelector = fmt.Sprintf("`%s`.`%s`", tableName, field)
			}

			conditions = append(conditions, fmt.Sprintf("LOWER(%s) LIKE ?", columnSelector))
			args = append(args, lowerKeyword)
		}

		if len(conditions) > 0 {
			query = query.Where(strings.Join(conditions, " OR "), args...)
		}
	}

	// Per-column search: col_[field]=value
	query = applyColumnSearches(c, query, columnMap)

	sortBy = normalizeColumnName(sortBy, columnMap)
	if sortBy == "" {
		sortBy = "id"
		sortOrder = "ASC"
	}

	var total int64
	if err := query.
		Count(&total).
		Error; err != nil {
		return nil, err
	}

	// disini callback query nya
	if callback != nil {
		query = callback(query)
	}

	offset := (page - 1) * limit
	paginatedQuery := query.
		Order(clause.OrderByColumn{Column: clause.Column{Table: tableName, Name: sortBy}, Desc: sortOrder == "DESC"}).
		Offset(offset).
		Limit(limit)

	if destination != nil {
		if err := paginatedQuery.
			Find(destination).
			Error; err != nil {
			return nil, err
		}
	}

	totalPages := 1
	if total > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(limit)))
	}

	return &PaginationResult{
		Page:      page,
		Limit:     limit,
		Total:     total,
		TotalPage: totalPages,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}, nil

}

func PaginationScoped(c *fiber.Ctx, scopedDb *gorm.DB, model interface{}, search []string, destination interface{}) (*PaginationResult, error) {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	keyword := strings.TrimSpace(c.Query("search", ""))
	searchFieldsQuery := strings.TrimSpace(c.Query("search_fields", ""))
	sortBy := strings.TrimSpace(c.Query("sort_by", "id"))
	sortOrder := strings.ToUpper(strings.TrimSpace(c.Query("sort_order", "ASC")))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if sortOrder != "ASC" && sortOrder != "DESC" {
		sortOrder = "ASC"
	}

	columnMap := getModelColumnMap(model)
	effectiveSearch := filterSearchFields(search, searchFieldsQuery, columnMap)

	tableName := ""
	stmt := &gorm.Statement{DB: variable.Db}
	if err := stmt.Parse(model); err == nil && stmt.Schema != nil {
		tableName = stmt.Schema.Table
	}

	query := scopedDb.Model(model)
	if keyword != "" && len(effectiveSearch) > 0 {
		lowerKeyword := "%" + strings.ToLower(keyword) + "%"
		conditions := make([]string, 0, len(effectiveSearch))
		args := make([]interface{}, 0, len(effectiveSearch))

		for _, field := range effectiveSearch {
			field = normalizeColumnName(field, columnMap)
			if field == "" {
				continue
			}

			columnSelector := field
			if tableName != "" {
				columnSelector = fmt.Sprintf("`%s`.`%s`", tableName, field)
			}

			conditions = append(conditions, fmt.Sprintf("LOWER(%s) LIKE ?", columnSelector))
			args = append(args, lowerKeyword)
		}

		if len(conditions) > 0 {
			query = query.Where(strings.Join(conditions, " OR "), args...)
		}
	}

	// Per-column search: col_[field]=value
	query = applyColumnSearches(c, query, columnMap)

	sortBy = normalizeColumnName(sortBy, columnMap)
	if sortBy == "" {
		sortBy = "id"
		sortOrder = "ASC"
	}

	var total int64
	if err := query.
		Count(&total).
		Error; err != nil {
		return nil, err
	}

	offset := (page - 1) * limit
	paginatedQuery := query.
		Order(clause.OrderByColumn{Column: clause.Column{Table: tableName, Name: sortBy}, Desc: sortOrder == "DESC"}).
		Offset(offset).
		Limit(limit)

	if destination != nil {
		if err := paginatedQuery.
			Find(destination).
			Error; err != nil {
			return nil, err
		}
	}

	totalPages := 1
	if total > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(limit)))
	}

	return &PaginationResult{
		Page:      page,
		Limit:     limit,
		Total:     total,
		TotalPage: totalPages,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}, nil
}

func getModelColumnMap(model interface{}) map[string]string {
	columns := make(map[string]string)
	if variable.Db == nil {
		return columns
	}

	statement := &gorm.Statement{DB: variable.Db}
	if err := statement.Parse(model); err != nil || statement.Schema == nil {
		return columns
	}

	for _, field := range statement.Schema.Fields {
		dbName := strings.ToLower(field.DBName)
		columns[dbName] = field.DBName
		columns[strings.ToLower(field.Name)] = field.DBName
	}

	return columns
}

func normalizeColumnName(column string, validColumns map[string]string) string {
	key := strings.ToLower(strings.TrimSpace(column))
	if key == "" {
		return ""
	}

	if value, ok := validColumns[key]; ok {
		return value
	}

	return ""
}

func filterSearchFields(defaultSearch []string, searchFieldsQuery string, validColumns map[string]string) []string {
	allowed := make(map[string]struct{})
	fallback := make([]string, 0, len(defaultSearch))

	for _, field := range defaultSearch {
		normalized := normalizeColumnName(field, validColumns)
		if normalized == "" {
			continue
		}

		lower := strings.ToLower(normalized)
		if _, exists := allowed[lower]; exists {
			continue
		}

		allowed[lower] = struct{}{}
		fallback = append(fallback, normalized)
	}

	if strings.TrimSpace(searchFieldsQuery) == "" {
		return fallback
	}

	requested := strings.Split(searchFieldsQuery, ",")
	result := make([]string, 0, len(requested))
	seen := make(map[string]struct{})

	for _, field := range requested {
		normalized := normalizeColumnName(field, validColumns)
		if normalized == "" {
			continue
		}

		lower := strings.ToLower(normalized)
		if len(allowed) > 0 {
			if _, ok := allowed[lower]; !ok {
				continue
			}
		}

		if _, exists := seen[lower]; exists {
			continue
		}

		seen[lower] = struct{}{}
		result = append(result, normalized)
	}

	if len(result) == 0 {
		return fallback
	}

	return result
}

// applyColumnSearches reads col_[field]=value query params and adds
// individual AND conditions (LOWER(field) LIKE '%value%') to the query.
func applyColumnSearches(c *fiber.Ctx, query *gorm.DB, columnMap map[string]string) *gorm.DB {
	c.Context().QueryArgs().VisitAll(func(key, value []byte) {
		keyStr := string(key)
		if !strings.HasPrefix(keyStr, "col_") {
			return
		}

		val := strings.TrimSpace(string(value))
		if val == "" {
			return
		}

		fieldName := strings.TrimPrefix(keyStr, "col_")
		normalized := normalizeColumnName(fieldName, columnMap)
		if normalized == "" {
			return
		}

		lowerVal := "%" + strings.ToLower(val) + "%"
		query = query.Where(fmt.Sprintf("LOWER(%s) LIKE ?", normalized), lowerVal)
	})
	return query
}
