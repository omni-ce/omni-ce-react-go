package database

import (
	"log"
	"os"
	"react-go/core/environment"
	"react-go/core/modules"
	"react-go/core/variable"
	"reflect"
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
		modelVal := reflect.ValueOf(model)
		method := modelVal.MethodByName("Seed")

		if method.IsValid() && method.Type().NumIn() == 0 && method.Type().NumOut() == 1 {
			model_name := reflect.TypeOf(model).Elem().Name()
			var count int64
			variable.Db.Model(model).Count(&count)
			if count == 0 {
				results := method.Call(nil)
				if len(results) > 0 {
					sliceVal := results[0]
					if sliceVal.Kind() == reflect.Slice {
						for i := 0; i < sliceVal.Len(); i++ {
							elem := sliceVal.Index(i)
							elemPtr := reflect.New(elem.Type())
							elemPtr.Elem().Set(elem)
							if err := variable.Db.Create(elemPtr.Interface()).Error; err != nil {
								log.Printf("❌ Error seeding %s: %v", model_name, err)
							}
						}
						log.Printf("✅ %s seeded", model_name)
					}
				}
			} else {
				log.Printf("⚠️  %s already seeded", model_name)
			}
		}
	}
	go keepDBAlive()
}
