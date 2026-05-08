package modules

import (
	// No Reference
	apikey "react-go/core/modules/apikey/model"
	auth "react-go/core/modules/auth/model"
	captcha "react-go/core/modules/captcha/model"
	setting "react-go/core/modules/setting/model"
	whitelist "react-go/core/modules/whitelist/model"

	// Master
	dashboard "react-go/core/modules/dashboard/model"
	notification "react-go/core/modules/notification/model"
	role "react-go/core/modules/role/model"
	rule "react-go/core/modules/rule/model"
	user "react-go/core/modules/user/model"

	// Custom
	master_data "react-go/core/modules/master_data/model"
	product "react-go/core/modules/product/model"

	"gorm.io/gorm"
)

func Models() []interface{} {
	return []interface{}{
		&captcha.Captcha{},
		&auth.Access{},
		//
		&user.User{},
		&role.RoleDivision{},
		&role.Role{},
		&role.RoleUser{},
		&rule.Rule{},
		&notification.Notification{},
		&setting.Setting{},
		&whitelist.Whitelist{},
		&apikey.ApiKey{},
		&dashboard.DashboardWidget{},
		// Custom
		&master_data.MasterData{},
		&product.ProductCategory{},
		&product.ProductBrand{},
		&product.ProductVariant{},
		&product.ProductMemory{},
		&product.ProductColor{},
	}
}

func SeedAll(db *gorm.DB) {
	user.User{}.Seed(db)
	setting.Setting{}.Seed(db)
	role.RoleDivision{}.Seed(db)
	role.Role{}.Seed(db)
	rule.Rule{}.Seed(db)

	// Custom
}
