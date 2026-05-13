package variable

import (
	"gorm.io/gorm"
)

var Db *gorm.DB
var SeedAll func(*gorm.DB)
