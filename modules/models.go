package modules

import (
	apikey "react-go/modules/apikey/model"
	auth "react-go/modules/auth/model"
	master_data "react-go/modules/master_data/model"
	notification "react-go/modules/notification/model"
	role "react-go/modules/role/model"
	role_menu "react-go/modules/role/model"
	setting "react-go/modules/setting/model"
	user "react-go/modules/user/model"
	whitelist "react-go/modules/whitelist/model"

	"gorm.io/gorm"
)

func Models() []interface{} {
	return []interface{}{
		&auth.Access{},
		&user.User{},
		&role.Role{},
		&role_menu.RoleMenu{},
		&notification.Notification{},
		&setting.Setting{},
		&whitelist.Whitelist{},
		&apikey.ApiKey{},
		&master_data.MasterData{},
	}
}

func SeedAll(db *gorm.DB) {
	user.User{}.Seed(db)
	role.Role{}.Seed(db)
	setting.Setting{}.Seed(db)
}
