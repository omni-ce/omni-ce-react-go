package environment

import (
	"os"
	"strings"
)

func GetDatabase() (string, string, string, string, string, string) {
	provider := strings.ToLower(os.Getenv("DATABASE_PROVIDER"))
	host := os.Getenv("DATABASE_HOST")
	port := os.Getenv("DATABASE_PORT")
	user := os.Getenv("DATABASE_USER")
	pass := os.Getenv("DATABASE_PASS")
	dbName := os.Getenv("DATABASE_NAME")

	return provider, host, port, user, pass, dbName
}

func GetDatabaseMigrate() bool {
	migrate := os.Getenv("DATABASE_MIGRATE")
	isMigrate := false
	if migrate == "true" || migrate == "" {
		isMigrate = true
	}
	return isMigrate
}
