package option

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"

	company "react-go/core/modules/company/model"
	product "react-go/core/modules/product/model"
	role "react-go/core/modules/role/model"
	user "react-go/core/modules/user/model"

	"github.com/gofiber/fiber/v2"
)

func Divisions(c *fiber.Ctx) error {
	divisions := make([]role.RoleDivision, 0)
	if err := variable.Db.
		Model(&role.RoleDivision{}).
		Find(&divisions).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find divisions", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range divisions {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, "Get divisions success", rows)
}

func RolesOnDivision(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid division id", nil)
	}

	roles := make([]role.Role, 0)
	if err := variable.Db.
		Model(&role.Role{}).
		Where("role_division_id = ?", id).
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find roles", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range roles {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, "Get roles success", rows)
}

func Roles(c *fiber.Ctx) error {
	divisions := make([]role.RoleDivision, 0)
	if err := variable.Db.
		Model(&role.RoleDivision{}).
		Where("is_active = ?", true).
		Find(&divisions).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find divisions", nil)
	}
	divisionIds := make([]uint, 0)
	for _, d := range divisions {
		divisionIds = append(divisionIds, d.ID)
	}

	roles := make([]role.Role, 0)
	if err := variable.Db.
		Model(&role.Role{}).
		Where("is_active = ? AND role_division_id IN (?)", true, divisionIds).
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find roles", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range roles {
		var division string
		for _, d := range divisions {
			if d.ID == row.RoleDivisionID {
				division = d.Name
				break
			}
		}
		label := fmt.Sprintf("%s - %s", division, row.Name)
		rows = append(rows, types.Option{
			Label: label,
			Value: row.ID,
		})
	}

	return dto.OK(c, "Get roles success", rows)
}

func CompanyEntities(c *fiber.Ctx) error {
	entities := make([]company.CompanyEntity, 0)
	if err := variable.Db.
		Model(&company.CompanyEntity{}).
		Find(&entities).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find categories", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range entities {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, "Get company entities success", rows)
}

func Users(c *fiber.Ctx) error {
	users := make([]user.User, 0)
	if err := variable.Db.
		Model(&user.User{}).
		Where("is_active = ?", true).
		Find(&users).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find users", nil)
	}
	userIds := make([]string, 0)
	for _, u := range users {
		userIds = append(userIds, u.ID.String())
	}

	roleUsers := make([]role.RoleUser, 0)
	if err := variable.Db.
		Model(&role.RoleUser{}).
		Where("user_id IN (?)", userIds).
		Find(&roleUsers).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find role users", nil)
	}
	roleIds := make([]uint, 0)
	for _, r := range roleUsers {
		roleIds = append(roleIds, r.RoleID)
	}
	roleUserMap := make(map[string][]uint)
	for _, r := range roleUsers {
		user_id := r.UserID.String()
		if _, ok := roleUserMap[user_id]; !ok {
			roleUserMap[user_id] = make([]uint, 0)
		}
		roleUserMap[user_id] = append(roleUserMap[user_id], r.RoleID)
	}

	roles := make([]role.Role, 0)
	if err := variable.Db.
		Model(&role.Role{}).
		Where("is_active = ? AND id IN (?)", true, roleIds).
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find roles", nil)
	}
	divisionIds := make([]uint, 0)
	for _, r := range roles {
		divisionIds = append(divisionIds, r.RoleDivisionID)
	}

	divisions := make([]role.RoleDivision, 0)
	if err := variable.Db.
		Model(&role.RoleDivision{}).
		Where("is_active = ? AND id IN (?)", true, divisionIds).
		Find(&divisions).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find divisions", nil)
	}

	roleDivisions := make(map[uint]string)
	for _, role := range roles {
		var division string
		for _, d := range divisions {
			if d.ID == role.RoleDivisionID {
				division = d.Name
				break
			}
		}
		roleDivisions[role.ID] = fmt.Sprintf("%s - %s", division, role.Name)
	}

	rows := make([]types.Option, 0)
	for _, row := range users {
		roleIds := roleUserMap[row.ID.String()]
		formattedRoles := make([]any, 0)
		for _, rid := range roleIds {
			if name, ok := roleDivisions[rid]; ok {
				formattedRoles = append(formattedRoles, name)
			}
		}
		rows = append(rows, types.Option{
			Label: row.Name,
			Value: row.ID,
			Array: &formattedRoles,
		})
	}

	return dto.OK(c, "Get users success", rows)
}

func ProductCategories(c *fiber.Ctx) error {
	categories := make([]product.ProductCategory, 0)
	if err := variable.Db.
		Model(&product.ProductCategory{}).
		Find(&categories).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find categories", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range categories {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, "Get product categories success", rows)
}

func ProductBrands(c *fiber.Ctx) error {
	brands := make([]product.ProductBrand, 0)
	if err := variable.Db.
		Model(&product.ProductBrand{}).
		Find(&brands).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find product brands", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range brands {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, "Get product brands success", rows)
}

func ProductVariants(c *fiber.Ctx) error {
	variants := make([]product.ProductVariant, 0)
	if err := variable.Db.
		Model(&product.ProductVariant{}).
		Where("is_active = ?", true).
		Find(&variants).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find product variants", nil)
	}
	brandIDs := make([]uint, 0)
	for _, v := range variants {
		brandIDs = append(brandIDs, v.BrandID)
	}

	brands := make([]product.ProductBrand, 0)
	if err := variable.Db.Model(&product.ProductBrand{}).
		Where("id IN (?)", brandIDs).
		Find(&brands).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find product brand", nil)
	}
	brandMap := make(map[uint]string)
	for _, b := range brands {
		brandMap[b.ID] = b.Name
	}

	rows := make([]types.Option, 0)
	for _, row := range variants {
		label := fmt.Sprintf("%s - %s", brandMap[row.BrandID], row.Name)
		rows = append(rows, types.Option{
			Label: label,
			Value: row.ID,
		})
	}

	return dto.OK(c, "Get product variants success", rows)
}

func ProductVariant(c *fiber.Ctx) error {
	idParam := c.Params("brand_id")
	brandID, err := strconv.Atoi(idParam)
	if err != nil {
		return dto.BadRequest(c, "Invalid brand id", nil)
	}

	variants := make([]product.ProductVariant, 0)
	if err := variable.Db.
		Model(&product.ProductVariant{}).
		Where("brand_id = ? AND is_active = ?", brandID, true).
		Find(&variants).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find product variants", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range variants {
		rows = append(rows, types.Option{
			Label: row.Name,
			Value: row.ID,
		})
	}

	return dto.OK(c, "Get product variants success", rows)
}

func ProductMemories(c *fiber.Ctx) error {
	memories := make([]product.ProductMemory, 0)
	if err := variable.Db.
		Model(&product.ProductMemory{}).
		Find(&memories).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find product memories", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range memories {
		rows = append(rows, row.Option())
	}

	return dto.OK(c, "Get product memories success", rows)
}

func ProductColors(c *fiber.Ctx) error {
	colors := make([]product.ProductColor, 0)
	if err := variable.Db.
		Model(&product.ProductColor{}).
		Find(&colors).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to find product colors", nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range colors {
		rows = append(rows, row.Option())
	}

	return dto.OK(c, "Get product colors success", rows)
}
