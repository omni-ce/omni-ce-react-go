package model

import (
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductBrand struct {
	ID       uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	Key      string `json:"key" gorm:"type:varchar(255);uniqueIndex;not null"`
	Logo     string `json:"logo" gorm:"type:varchar(255);not null"`
	Name     string `json:"name" gorm:"type:varchar(255);not null"`
	IsActive bool   `json:"is_active" gorm:"default:true"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"not null"`
}

func (s *ProductBrand) Map() map[string]any {
	return map[string]any{
		"id":         s.ID,
		"key":        s.Key,
		"logo":       s.Logo,
		"name":       s.Name,
		"is_active":  s.IsActive,
		"created_at": s.CreatedAt,
		"created_by": s.CreatedBy,
		"updated_at": s.UpdatedAt,
		"updated_by": s.UpdatedBy,
	}
}

func (ProductBrand) Seed(db *gorm.DB) {
	var count int64
	db.Model(&ProductBrand{}).Count(&count)

	if count == 0 {
		stats := []ProductBrand{
			{
				Key:  "samsung",
				Logo: "/favicon.svg",
				Name: "Samsung",
			},
			{
				Key:  "apple",
				Logo: "/favicon.svg",
				Name: "Apple",
			},
		}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Product Brand seeded")
	} else {
		log.Println("⚠️ Product Brand already seeded")
	}
}
