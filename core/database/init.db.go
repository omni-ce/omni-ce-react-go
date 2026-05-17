package database

import (
	"log"
	"os"
	"react-go/core/environment"
	"react-go/core/modules"
	"react-go/core/variable"
	"reflect"

	"gorm.io/gorm"
)

func init() {
	provider, _, _, _, _, _ := environment.GetDatabase()

	// create dir if not exists
	if _, err := os.Stat("./database"); os.IsNotExist(err) && provider == "sqlite" {
		os.Mkdir("./database", 0755) // why create folder database? karena kebutuhan volume di docker harus ke folder bukan ke file
	}

	var err error
	variable.Db, err = OpenDB()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("✅ Database initialized")

	models := modules.Models()
	for _, model := range models {
		if s, ok := model.(interface{ Seed(*gorm.DB) }); ok {
			model_name := reflect.TypeOf(model).Elem().Name()
			var count int64
			variable.Db.Model(model).Count(&count)
			if count == 0 {
				log.Printf("✅ %s seeded", model_name)
				s.Seed(variable.Db)
			} else {
				log.Printf("⚠️  %s already seeded", model_name)
			}
		}
	}
	go keepDBAlive()
}
