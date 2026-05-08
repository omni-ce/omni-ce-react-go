package model

import (
	"log"
	"time"

	"gorm.io/gorm"
)

type ProductCategory struct {
	ID       uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	Key      string `json:"key" gorm:"type:varchar(255);uniqueIndex;not null"`
	Name     string `json:"name" gorm:"type:varchar(255);not null"`
	IsActive bool   `json:"is_active" gorm:"default:true"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uint      `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uint      `json:"updated_by" gorm:"not null"`
}

func (s *ProductCategory) Map() map[string]any {
	return map[string]any{
		"id":         s.ID,
		"key":        s.Key,
		"name":       s.Name,
		"is_active":  s.IsActive,
		"created_at": s.CreatedAt,
		"created_by": s.CreatedBy,
		"updated_at": s.UpdatedAt,
		"updated_by": s.UpdatedBy,
	}
}

func (ProductCategory) Seed(db *gorm.DB) {
	var count int64
	db.Model(&ProductCategory{}).Count(&count)

	if count == 0 {
		stats := []ProductCategory{
			{
				Key:  "electronics",
				Name: "{\"id\": \"Barang Elektronik\", \"en\": \"Electronics\"}",
			},
		}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Product Category seeded")
	} else {
		log.Println("⚠️ Product Category already seeded")
	}
}
