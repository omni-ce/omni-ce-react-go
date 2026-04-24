package model

import (
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
	var count int64
	db.Model(&Setting{}).Count(&count)

	if count == 0 {
		stats := []Setting{
			// {
			// 	Key:   "auth_password",
			// 	Value: fmt.Sprintf("%x", md5.Sum([]byte("admin"))),
			// },
		}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Setting seeded")
	} else {
		log.Println("⚠️  Setting already seeded")
	}
}
