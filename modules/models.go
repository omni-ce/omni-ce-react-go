package modules

import (
	apikey "react-go/modules/apikey/model"
	auth "react-go/modules/auth/model"
	notification "react-go/modules/notification/model"
	setting "react-go/modules/setting/model"
	user "react-go/modules/user/model"
	whitelist "react-go/modules/whitelist/model"

	"gorm.io/gorm"
)

func Models() []interface{} {
	return []interface{}{
		&auth.Access{},
		&user.User{},
		&notification.Notification{},
		&setting.Setting{},
		&whitelist.Whitelist{},
		&apikey.ApiKey{},
	}
}

func SeedAll(db *gorm.DB) {
	user.User{}.Seed(db)
	setting.Setting{}.Seed(db)
}
