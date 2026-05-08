package model

import (
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
)

type ProductColor struct {
	ID       uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	Key      string `json:"key" gorm:"type:varchar(100);uniqueIndex;not null"`
	Name     string `json:"name" gorm:"type:varchar(100);not null"`
	HexCode  string `json:"hex_code" gorm:"type:varchar(10);not null"`
	IsActive bool   `json:"is_active" gorm:"default:true"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"not null"`
}

func (s *ProductColor) Map() map[string]any {
	return map[string]any{
		"id":         s.ID,
		"key":        s.Key,
		"name":       s.Name,
		"hex_code":   s.HexCode,
		"is_active":  s.IsActive,
		"created_at": s.CreatedAt,
		"created_by": s.CreatedBy,
		"updated_at": s.UpdatedAt,
		"updated_by": s.UpdatedBy,
	}
}

func (s *ProductColor) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}
