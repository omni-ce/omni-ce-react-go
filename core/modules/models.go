package modules

import (
	apikey "react-go/core/modules/apikey/model"
	auth "react-go/core/modules/auth/model"
	captcha "react-go/core/modules/captcha/model"
	dashboard "react-go/core/modules/dashboard/model"
	master_data "react-go/core/modules/master_data/model"
	notification "react-go/core/modules/notification/model"
	role "react-go/core/modules/role/model"
	rule "react-go/core/modules/rule/model"
	setting "react-go/core/modules/setting/model"
	user "react-go/core/modules/user/model"
	whitelist "react-go/core/modules/whitelist/model"

	"gorm.io/gorm"
)

func Models() []interface{} {
	return []interface{}{
		&captcha.Captcha{},
		&auth.Access{},
		&user.User{},
		&role.RoleDivision{},
		&role.Role{},
		&role.RoleUser{},
		&rule.Rule{},
		&notification.Notification{},
		&setting.Setting{},
		&whitelist.Whitelist{},
		&apikey.ApiKey{},
		&master_data.MasterData{},
		&dashboard.DashboardWidget{},
	}
}

func SeedAll(db *gorm.DB) {
	user.User{}.Seed(db)
	setting.Setting{}.Seed(db)
	role.RoleDivision{}.Seed(db)
	role.Role{}.Seed(db)
	rule.Rule{}.Seed(db)
}
