package modules

import (
	"react-go/modules/apikey"
	"react-go/modules/setting"
	"react-go/modules/whitelist"

	"gorm.io/gorm"
)

func Models() []interface{} {
	return []interface{}{
		&setting.Setting{},
		&whitelist.Whitelist{},
		&apikey.ApiKey{},
	}
}

func SeedAll(db *gorm.DB) {
	setting.Seed(db)
}
