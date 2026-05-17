package seed

import (
	"log"
	"react-go/core/variable"
	"reflect"
)

func Dynamic() {
	models := variable.Models()
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
}
