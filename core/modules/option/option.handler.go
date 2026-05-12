package option

import (
	"fmt"
	"react-go/core/dto"
	"react-go/core/types"
	"react-go/core/variable"
	"strconv"

	company "react-go/core/modules/company/model"
	master_data "react-go/core/modules/master_data/model"
	product "react-go/core/modules/product/model"
	role "react-go/core/modules/role/model"
	user "react-go/core/modules/user/model"
	warehouse "react-go/core/modules/warehouse/model"

	"github.com/gofiber/fiber/v2"
)

func Units(c *fiber.Ctx) error {
	units := make([]master_data.Unit, 0)
	if err := variable.Db.
		Model(&master_data.Unit{}).
		Find(&units).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari unit",
			En: "Failed to find units",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range units {
		unit := row.Option()
		unit.Meta = &map[string]any{
			"short_name": row.ShortName,
		}
		rows = append(rows, unit)
	}

	return dto.OK(c, types.Language{
		Id: "Unit berhasil diambil",
		En: "Unit retrieved successfully",
	}, rows)
}

func Divisions(c *fiber.Ctx) error {
	divisions := make([]role.RoleDivision, 0)
	if err := variable.Db.
		Model(&role.RoleDivision{}).
		Find(&divisions).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari divisi",
			En: "Failed to find divisions",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range divisions {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, types.Language{
		Id: "Divisi berhasil diambil",
		En: "Divisi retrieved successfully",
	}, rows)
}

func RolesOnDivision(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID divisi tidak valid",
			En: "Invalid division id",
		}, nil)
	}

	roles := make([]role.Role, 0)
	if err := variable.Db.
		Model(&role.Role{}).
		Where("role_division_id = ?", id).
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari peran",
			En: "Failed to find roles",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range roles {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, types.Language{
		Id: "Peran berhasil diambil",
		En: "Roles retrieved successfully",
	}, rows)
}

func Roles(c *fiber.Ctx) error {
	divisions := make([]role.RoleDivision, 0)
	if err := variable.Db.
		Model(&role.RoleDivision{}).
		Where("is_active = ?", true).
		Find(&divisions).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari divisi",
			En: "Failed to find divisions",
		}, nil)
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari peran",
			En: "Failed to find roles",
		}, nil)
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

	return dto.OK(c, types.Language{
		Id: "Peran berhasil diambil",
		En: "Roles retrieved successfully",
	}, rows)
}

func CompanyEntities(c *fiber.Ctx) error {
	entities := make([]company.CompanyEntity, 0)
	if err := variable.Db.
		Model(&company.CompanyEntity{}).
		Find(&entities).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari entitas perusahaan",
			En: "Failed to find company entities",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range entities {
		if row.IsActive {
			rows = append(rows, types.Option{
				Label: row.Name,
				Value: row.ID,
				Meta: &map[string]any{
					"logo": row.Logo,
				},
			})
		}
	}

	return dto.OK(c, types.Language{
		Id: "Entitas perusahaan berhasil diambil",
		En: "Company entities retrieved successfully",
	}, rows)
}

func CompanyBranches(c *fiber.Ctx) error {
	branches := make([]company.CompanyBranch, 0)
	if err := variable.Db.
		Model(&company.CompanyBranch{}).
		Find(&branches).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari cabang perusahaan",
			En: "Failed to find company branches",
		}, nil)
	}

	entities := make([]company.CompanyEntity, 0)
	if err := variable.Db.
		Model(&company.CompanyEntity{}).
		Find(&entities).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari entitas perusahaan",
			En: "Failed to find company entities",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range branches {
		if row.IsActive {
			label := ""
			entity := company.CompanyEntity{}
			for _, e := range entities {
				if e.ID == row.EntityID {
					label = fmt.Sprintf("%s - %s", e.Name, row.Name)
					entity = e
					break
				}
			}
			rows = append(rows, types.Option{
				Label: label,
				Value: row.ID,
				Meta: &map[string]any{
					"entity_logo": entity.Logo,
				},
			})
		}
	}

	return dto.OK(c, types.Language{
		Id: "Cabang perusahaan berhasil diambil",
		En: "Company branches retrieved successfully",
	}, rows)
}

func Users(c *fiber.Ctx) error {
	users := make([]user.User, 0)
	if err := variable.Db.
		Model(&user.User{}).
		Where("role = ? AND is_active = ?", user.UserRoleClient, true).
		Find(&users).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari pengguna",
			En: "Failed to find users",
		}, nil)
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari role users",
			En: "Failed to find role users",
		}, nil)
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari peran",
			En: "Failed to find roles",
		}, nil)
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari divisi",
			En: "Failed to find divisions",
		}, nil)
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
			Meta: &map[string]any{
				"avatar": row.Avatar,
			},
		})
	}

	return dto.OK(c, types.Language{
		Id: "Pengguna berhasil diambil",
		En: "Users retrieved successfully",
	}, rows)
}

// Product

func ProductCategories(c *fiber.Ctx) error {
	categories := make([]product.ProductCategory, 0)
	if err := variable.Db.
		Model(&product.ProductCategory{}).
		Find(&categories).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari kategori",
			En: "Failed to find categories",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range categories {
		if row.IsActive {
			rows = append(rows, types.Option{
				Label: row.Name,
				Value: row.ID,
				Meta: &map[string]any{
					"icon": row.Icon,
				},
			})
		}
	}

	return dto.OK(c, types.Language{
		Id: "Kategori produk berhasil diambil",
		En: "Product categories retrieved successfully",
	}, rows)
}

func ProductTypesByCategory(c *fiber.Ctx) error {
	categoryID := c.Params("category_id")
	if categoryID == "" {
		return dto.BadRequest(c, types.Language{
			Id: "ID kategori tidak ada",
			En: "Category ID is required",
		}, nil)
	}
	_types := make([]product.ProductType, 0)
	if err := variable.Db.
		Model(&product.ProductType{}).
		Where("category_id = ?", categoryID).
		Find(&_types).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari tipe produk",
			En: "Failed to find product types",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range _types {
		if row.IsActive {
			rows = append(rows, row.Option())
		}
	}

	return dto.OK(c, types.Language{
		Id: "Tipe produk berhasil diambil",
		En: "Product types retrieved successfully",
	}, rows)
}

func ProductBrands(c *fiber.Ctx) error {
	brands := make([]product.ProductBrand, 0)
	if err := variable.Db.
		Model(&product.ProductBrand{}).
		Find(&brands).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari brand produk",
			En: "Failed to find product brands",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range brands {
		if row.IsActive {
			rows = append(rows, types.Option{
				Label: row.Name,
				Value: row.ID,
				Meta: &map[string]any{
					"logo": row.Logo,
				},
			})
		}
	}

	return dto.OK(c, types.Language{
		Id: "Brand produk berhasil diambil",
		En: "Product brands retrieved successfully",
	}, rows)
}

func ProductVariants(c *fiber.Ctx) error {
	variants := make([]product.ProductVariant, 0)
	if err := variable.Db.
		Model(&product.ProductVariant{}).
		Where("is_active = ?", true).
		Find(&variants).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari varian produk",
			En: "Failed to find product variants",
		}, nil)
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
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari brand produk",
			En: "Failed to find product brand",
		}, nil)
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

	return dto.OK(c, types.Language{
		Id: "Varian produk berhasil diambil",
		En: "Product variants retrieved successfully",
	}, rows)
}

func ProductVariant(c *fiber.Ctx) error {
	typeIdParam := c.Params("type_id")
	typeID, err := strconv.Atoi(typeIdParam)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID tipe tidak valid",
			En: "Invalid type id",
		}, nil)
	}

	brandIdParam := c.Params("brand_id")
	brandID, err := strconv.Atoi(brandIdParam)
	if err != nil {
		return dto.BadRequest(c, types.Language{
			Id: "ID brand tidak valid",
			En: "Invalid brand id",
		}, nil)
	}

	variants := make([]product.ProductVariant, 0)
	if err := variable.Db.
		Model(&product.ProductVariant{}).
		Where("type_id = ? AND brand_id = ? AND is_active = ?", typeID, brandID, true).
		Find(&variants).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari varian produk",
			En: "Failed to find product variants",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range variants {
		rows = append(rows, types.Option{
			Label: row.Name,
			Value: row.ID,
		})
	}

	return dto.OK(c, types.Language{
		Id: "Varian produk berhasil diambil",
		En: "Product variants retrieved successfully",
	}, rows)
}

func ProductMemories(c *fiber.Ctx) error {
	memories := make([]product.ProductMemory, 0)
	if err := variable.Db.
		Model(&product.ProductMemory{}).
		Find(&memories).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari memori produk",
			En: "Failed to find product memories",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range memories {
		rows = append(rows, row.Option())
	}

	return dto.OK(c, types.Language{
		Id: "Memori produk berhasil diambil",
		En: "Product memories retrieved successfully",
	}, rows)
}

func ProductColors(c *fiber.Ctx) error {
	colors := make([]product.ProductColor, 0)
	if err := variable.Db.
		Model(&product.ProductColor{}).
		Find(&colors).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari warna produk",
			En: "Failed to find product colors",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range colors {
		rows = append(rows, row.Option())
	}

	return dto.OK(c, types.Language{
		Id: "Warna produk berhasil diambil",
		En: "Product colors retrieved successfully",
	}, rows)
}

func ProductConditions(c *fiber.Ctx) error {
	conditions := make([]product.ProductCondition, 0)
	if err := variable.Db.
		Model(&product.ProductCondition{}).
		Find(&conditions).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari kondisi produk",
			En: "Failed to find product conditions",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range conditions {
		rows = append(rows, row.Option())
	}

	return dto.OK(c, types.Language{
		Id: "Kondisi produk berhasil diambil",
		En: "Product conditions retrieved successfully",
	}, rows)
}

func ProductItems(c *fiber.Ctx) error {
	items := make([]product.ProductItem, 0)
	if err := variable.Db.
		Model(&product.ProductItem{}).
		Find(&items).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari item produk",
			En: "Failed to find product items",
		}, nil)
	}

	categoryIds := make([]uint, 0)
	typeIds := make([]uint, 0)
	brandIds := make([]uint, 0)
	variantIds := make([]uint, 0)
	memoryIds := make([]uint, 0)
	colorIds := make([]uint, 0)

	for _, row := range items {
		categoryIds = append(categoryIds, row.CategoryID)
		typeIds = append(typeIds, row.TypeID)
		brandIds = append(brandIds, row.BrandID)
		variantIds = append(variantIds, row.VariantID)
		if row.MemoryID != nil {
			memoryIds = append(memoryIds, *row.MemoryID)
		}
		if row.ColorID != nil {
			colorIds = append(colorIds, *row.ColorID)
		}
	}

	categories := make([]product.ProductCategory, 0)
	if err := variable.Db.
		Model(&product.ProductCategory{}).
		Where("id IN (?)", categoryIds).
		Find(&categories).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari kategori produk",
			En: "Failed to find product categories",
		}, nil)
	}
	_types := make([]product.ProductType, 0)
	if err := variable.Db.
		Model(&product.ProductType{}).
		Where("id IN (?)", typeIds).
		Find(&_types).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari tipe produk",
			En: "Failed to find product types",
		}, nil)
	}
	brands := make([]product.ProductBrand, 0)
	if err := variable.Db.
		Model(&product.ProductBrand{}).
		Where("id IN (?)", brandIds).
		Find(&brands).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari brand produk",
			En: "Failed to find product brands",
		}, nil)
	}
	variants := make([]product.ProductVariant, 0)
	if err := variable.Db.
		Model(&product.ProductVariant{}).
		Where("id IN (?)", variantIds).
		Find(&variants).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari varian produk",
			En: "Failed to find product variants",
		}, nil)
	}
	memories := make([]product.ProductMemory, 0)
	if err := variable.Db.
		Model(&product.ProductMemory{}).
		Where("id IN (?)", memoryIds).
		Find(&memories).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari memori produk",
			En: "Failed to find product memories",
		}, nil)
	}
	colors := make([]product.ProductColor, 0)
	if err := variable.Db.
		Model(&product.ProductColor{}).
		Where("id IN (?)", colorIds).
		Find(&colors).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari warna produk",
			En: "Failed to find product colors",
		}, nil)
	}

	categoryMap := make(map[uint]string)
	for _, row := range categories {
		categoryMap[row.ID] = row.Name
	}
	typeMap := make(map[uint]string)
	for _, row := range _types {
		typeMap[row.ID] = row.Name
	}
	brandMap := make(map[uint]string)
	for _, row := range brands {
		brandMap[row.ID] = row.Name
	}
	variantMap := make(map[uint]string)
	for _, row := range variants {
		variantMap[row.ID] = row.Name
	}
	memoryMap := make(map[uint]string)
	for _, row := range memories {
		memoryMap[row.ID] = fmt.Sprintf("%d GB / %d GB", row.Ram, row.InternalStorage)
	}
	colorMap := make(map[uint]string)
	colorHexMap := make(map[uint]string)
	for _, row := range colors {
		colorMap[row.ID] = row.Name
		colorHexMap[row.ID] = row.HexCode
	}

	rows := make([]types.Option, 0)
	for _, row := range items {
		category := categoryMap[row.CategoryID]
		_type := typeMap[row.TypeID]
		brand := brandMap[row.BrandID]
		variant := variantMap[row.VariantID]
		memory := ""
		if row.MemoryID != nil {
			memory = memoryMap[*row.MemoryID]
		}
		color := ""
		colorHex := ""
		if row.ColorID != nil {
			color = colorMap[*row.ColorID]
			colorHex = colorHexMap[*row.ColorID]
		}

		label := fmt.Sprintf("%s %s", brand, variant)
		if memory != "" {
			label += fmt.Sprintf(" (%s)", memory)
		}
		if color != "" {
			label += fmt.Sprintf(" (%s)", color)
		}
		rows = append(rows, types.Option{
			Label: label,
			Value: row.ID,
			Meta: &map[string]any{
				"sku":       row.SKU,
				"category":  category,
				"type":      _type,
				"brand":     brand,
				"variant":   variant,
				"memory":    memory,
				"color":     color,
				"color_hex": colorHex,
			},
		})
	}

	return dto.OK(c, types.Language{
		Id: "Item produk berhasil diambil",
		En: "Product items retrieved successfully",
	}, rows)
}

// Warehouse

func WarehouseLocations(c *fiber.Ctx) error {
	locations := make([]warehouse.WarehouseLocation, 0)
	if err := variable.Db.
		Model(&warehouse.WarehouseLocation{}).
		Find(&locations).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari lokasi gudang",
			En: "Failed to find warehouse locations",
		}, nil)
	}
	branchIds := make([]uint, 0)
	for _, row := range locations {
		branchIds = append(branchIds, row.BranchID)
	}
	roleIds := make([]uint, 0)
	for _, row := range locations {
		roleIds = append(roleIds, row.RoleID)
	}

	roles := make([]role.Role, 0)
	if err := variable.Db.
		Model(&role.Role{}).
		Where("id IN (?)", roleIds).
		Find(&roles).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari role",
			En: "Failed to find role",
		}, nil)
	}

	divisionIds := make([]uint, 0)
	for _, row := range roles {
		divisionIds = append(divisionIds, row.RoleDivisionID)
	}

	divisions := make([]role.RoleDivision, 0)
	if err := variable.Db.
		Model(&role.RoleDivision{}).
		Where("id IN (?)", divisionIds).
		Find(&divisions).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari division role",
			En: "Failed to find role divisions",
		}, nil)
	}

	branches := make([]company.CompanyBranch, 0)
	if err := variable.Db.
		Model(&company.CompanyBranch{}).
		Where("id IN (?)", branchIds).
		Find(&branches).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari cabang perusahaan",
			En: "Failed to find company branches",
		}, nil)
	}
	entityIds := make([]uint, 0)
	for _, row := range branches {
		entityIds = append(entityIds, row.EntityID)
	}

	entities := make([]company.CompanyEntity, 0)
	if err := variable.Db.
		Model(&company.CompanyEntity{}).
		Where("id IN (?)", entityIds).
		Find(&entities).
		Error; err != nil {
		return dto.InternalServerError(c, types.Language{
			Id: "Gagal mencari entitas perusahaan",
			En: "Failed to find company entities",
		}, nil)
	}

	rows := make([]types.Option, 0)
	for _, row := range locations {
		if row.IsActive {
			var branch company.CompanyBranch
			for _, b := range branches {
				if b.ID == row.BranchID {
					branch = b
					break
				}
			}
			var entity company.CompanyEntity
			for _, e := range entities {
				if e.ID == branch.EntityID {
					entity = e
					break
				}
			}
			var _role role.Role
			for _, r := range roles {
				if r.ID == row.RoleID {
					_role = r
					break
				}
			}
			var division role.RoleDivision
			for _, d := range divisions {
				if d.ID == _role.RoleDivisionID {
					division = d
					break
				}
			}
			rows = append(rows, types.Option{
				Label: fmt.Sprintf("%s - %s : %s > %s", entity.Name, row.Name, _role.Name, division.Name),
				Value: row.ID,
				Meta: &map[string]any{
					"entity_logo": entity.Logo,
				},
			})
		}
	}

	return dto.OK(c, types.Language{
		Id: "Lokasi gudang berhasil diambil",
		En: "Warehouse locations retrieved successfully",
	}, rows)
}
