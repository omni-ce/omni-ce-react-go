package model

import (
	"log"
	"time"

	user "react-go/core/modules/user/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Example struct {
	ID   uint      `json:"id" gorm:"autoIncrement;primaryKey"`
	Key  uuid.UUID `json:"key" gorm:"type:char(36);uniqueIndex"`
	Name string    `json:"name"`
	Age  int       `json:"age"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (a *Example) BeforeCreate(tx *gorm.DB) error {
	if a.Key == uuid.Nil {
		uuidV7, _ := uuid.NewV7()
		a.Key = uuidV7
	}
	return nil
}

func (s *Example) Map() map[string]any {
	return map[string]any{
		"id":         s.ID,
		"name":       s.Name,
		"age":        s.Age,
		"created_at": s.CreatedAt,
	}
}

func (Example) Seed(db *gorm.DB) {
	var count int64
	db.Model(&Example{}).Count(&count)

	if count == 0 {
		stats := []Example{}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Example seeded")
	} else {
		log.Println("⚠️ Example already seeded")
	}
}
