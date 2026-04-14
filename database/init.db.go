package database

import (
	"log"
	"os"
	"react-go/modules"
	"react-go/variable"
)

func init() {
	// create dir if not exists
	if _, err := os.Stat("./database"); os.IsNotExist(err) {
		os.Mkdir("./database", 0755) // why create folder database? karena kebutuhan volume di docker harus ke folder bukan ke file
	}

	var err error
	variable.Db, err = OpenDB()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("✅ Database initialized")

	modules.SeedAll(variable.Db)
	go keepDBAlive()
}
