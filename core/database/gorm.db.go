package database

import (
	"context"
	"fmt"
	"log"
	"react-go/core/environment"
	"react-go/core/modules"
	"react-go/core/variable"
	"strings"
	"sync"
	"time"

	"github.com/oracle-samples/gorm-oracle/oracle"
	"gorm.io/driver/clickhouse"
	"gorm.io/driver/gaussdb"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
)

var dbMu sync.RWMutex

func keepDBAlive() {
	provider, _, _, _, _, _ := environment.GetDatabase()
	provider = strings.ToLower(provider)
	if provider == "" || provider == "sqlite" {
		return
	}

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		dbMu.RLock()
		current := variable.Db
		dbMu.RUnlock()
		if current == nil {
			continue
		}

		sqlDB, err := current.DB()
		if err != nil {
			log.Printf("❌ [db] get sql db error: %v", err)
			continue
		}

		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		err = sqlDB.PingContext(ctx)
		cancel()
		if err == nil {
			continue
		}

		log.Printf("❌ [db] ping failed: %v (will reconnect forever)", err)

		// Reconnect forever with backoff
		backoff := 1 * time.Second
		for {
			newDB, openErr := OpenDB()
			if openErr == nil {
				dbMu.Lock()
				variable.Db = newDB
				dbMu.Unlock()
				log.Printf("✅ [db] reconnected successfully")
				break
			}

			log.Printf("❌ [db] reconnect attempt failed: %v", openErr)
			time.Sleep(backoff)
			if backoff < 30*time.Second {
				backoff *= 2
			}
		}
	}
}

func OpenDB() (*gorm.DB, error) {
	provider, host, port, user, pass, dbName := environment.GetDatabase()
	if provider == "" {
		provider = "sqlite"
	}

	var dialector gorm.Dialector
	switch provider {
	case "mysql":
		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "3306"
		}
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			user, pass, host, port, dbName)
		dialector = mysql.Open(dsn)
		log.Printf("📦 Connecting to MySQL: %s@%s:%s/%s", user, host, port, dbName)

	case "postgres", "postgresql":
		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "5432"
		}
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
			host, user, pass, dbName, port)
		dialector = postgres.Open(dsn)
		log.Printf("📦 Connecting to PostgreSQL: %s@%s:%s/%s", user, host, port, dbName)

	case "gauss", "gaussdb":
		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "8000"
		}
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai",
			host, user, pass, dbName, port)
		dialector = gaussdb.Open(dsn)
		log.Printf("📦 Connecting to GaussDB: %s@%s:%s/%s", user, host, port, dbName)

	case "oracle", "oracledb", "oraclesql":
		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "1521"
		}
		dsn := fmt.Sprintf(`user="%s" password="%s" connectString="%s:%s/%s"`, user, pass, host, port, dbName)
		dialector = oracle.Open(dsn)
		log.Printf("📦 Connecting to Oracle: %s@%s:%s/%s", user, host, port, dbName)

	case "sqlserver", "mssql":
		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "9930"
		}
		dsn := fmt.Sprintf("sqlserver://%s:%s@%s:%s?database=%s", user, pass, host, port, dbName)
		dialector = sqlserver.Open(dsn)
		log.Printf("📦 Connecting to SQL Server: %s@%s:%s/%s", user, host, port, dbName)

	case "clickhouse":
		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "9000"
		}
		dsn := fmt.Sprintf("tcp://%s:%s?database=%s&username=%s&password=%s&read_timeout=10&write_timeout=20", host, port, dbName, user, pass)
		dialector = clickhouse.Open(dsn)
		log.Printf("📦 Connecting to ClickHouse: %s@%s:%s/%s", user, host, port, dbName)
	case "sqlite":
		if dbName == "" {
			dbName = "./database/system.sqlite"
		} else {
			if !strings.Contains(dbName, ".sqlite") && !strings.Contains(dbName, "./") {
				dbName = fmt.Sprintf("./database/%s.sqlite", dbName)
			}
		}
		dialector = sqlite.Open(dbName)
		log.Printf("📦 Using SQLite: %s", dbName)

	default:
		return nil, fmt.Errorf("unsupported database provider: %s (supported: sqlite, mysql, postgres)", provider)
	}

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(modules.Models()...); err != nil {
		return nil, err
	}
	log.Println("✅ Database migrated successfully!")

	variable.Db = db
	return db, nil
}
