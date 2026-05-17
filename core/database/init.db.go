package database

import (
	"log"
	"os"
	"react-go/core/database/seed"
	"react-go/core/environment"
	"react-go/core/variable"
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

	seed.Dynamic()
	go keepDBAlive()
}
