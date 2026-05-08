package model

import (
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductVariant struct {
	ID          uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	BrandID     uint   `json:"brand_id" gorm:"not null"`
	Key         string `json:"key" gorm:"type:varchar(255);uniqueIndex;not null"`
	Name        string `json:"name" gorm:"type:varchar(255);not null"`
	Description string `json:"description" gorm:"type:varchar(255);not null"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`

	// relations
	Brand ProductBrand `json:"brand" gorm:"foreignKey:BrandID;references:ID;onDelete:CASCADE"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"not null"`
}

func (s *ProductVariant) Map() map[string]any {
	return map[string]any{
		"id":          s.ID,
		"brand_id":    s.BrandID,
		"key":         s.Key,
		"name":        s.Name,
		"description": s.Description,
		"is_active":   s.IsActive,
		"created_at":  s.CreatedAt,
		"created_by":  s.CreatedBy,
		"updated_at":  s.UpdatedAt,
		"updated_by":  s.UpdatedBy,
	}
}

func (ProductVariant) Seed(db *gorm.DB) {
	var count int64
	db.Model(&ProductVariant{}).Count(&count)

	if count == 0 {
		stats := []ProductVariant{
			{
				BrandID: 2,
				Key:     "z-fold-512",
				Name:    "Z Fold 512",
			},
			{
				BrandID: 2,
				Key:     "z-fold-256",
				Name:    "Z Fold 256",
			},
		}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Product Variant seeded")
	} else {
		log.Println("⚠️ Product Variant already seeded")
	}
}
