package model

import (
	"crypto/md5"
	"fmt"
	"log"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Setting struct {
	ID    uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	Key   string    `json:"key" gorm:"uniqueIndex"`
	Value string    `json:"value" gorm:"type:text"`
}

func (s *Setting) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func (Setting) Seed(db *gorm.DB) {

	hash_password := fmt.Sprintf("%x", md5.Sum([]byte("admin")))

	settings := map[string]string{
		"auth_password": hash_password,
	}

	inserts := []string{}
	exists := []string{}
	for key, value := range settings {
		var s Setting
		if err := db.Where("key = ?", key).First(&s).Error; err != nil {
			db.Create(&Setting{Key: key, Value: value})
			inserts = append(inserts, key)
		} else {
			exists = append(exists, key)
		}
	}
	log.Printf("✅ Inserted %d settings!", len(inserts))
	log.Printf("👌 Already exists %d settings!", len(exists))
}
