package model

import (
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
)

type ProductItem struct {
	ID          uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	BrandID     uint   `json:"brand_id" gorm:"not null"`
	Key         string `json:"key" gorm:"type:varchar(255);uniqueIndex;not null"`
	Name        string `json:"name" gorm:"type:varchar(255);not null"`
	Description string `json:"description" gorm:"type:varchar(255);not null"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`

	// relations
	Brand ProductBrand `json:"brand" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"not null"`
}

func (s *ProductItem) Map() map[string]any {
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

func (s *ProductItem) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}
