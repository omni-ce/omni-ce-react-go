package model

import (
	user "react-go/core/modules/user/model"
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
)

type ProductVariant struct {
	ID      uint `json:"id" gorm:"autoIncrement;primaryKey"`
	TypeID  uint `json:"type_id" gorm:"null"`
	BrandID uint `json:"brand_id" gorm:"not null"`

	Key         string `json:"key" gorm:"type:varchar(255);uniqueIndex;not null"`
	Name        string `json:"name" gorm:"type:varchar(255);not null"`
	Description string `json:"description" gorm:"type:varchar(255);not null"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`

	// relations
	Type  ProductType  `json:"type" gorm:"foreignKey:TypeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Brand ProductBrand `json:"brand" gorm:"foreignKey:BrandID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
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

func (s *ProductVariant) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}
