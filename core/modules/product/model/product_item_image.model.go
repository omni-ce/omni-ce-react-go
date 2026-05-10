package model

import (
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProductItemImage struct {
	ID          uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	ItemID      uint      `json:"item_id" gorm:"not null"`
	Url         string    `json:"url" gorm:"type:varchar(500);not null"`
	Description string    `json:"description" gorm:"type:varchar(255)"`
	IsPrimary   bool      `json:"is_primary" gorm:"default:false"`

	// relations
	Item ProductItem `json:"item" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	UploadedAt time.Time `json:"uploaded_at" gorm:"autoCreateTime"`
	UploadedBy uuid.UUID `json:"uploaded_by" gorm:"not null"`
}

func (s *ProductItemImage) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		uuidV7, _ := uuid.NewV7()
		s.ID = uuidV7
	}
	return nil
}

func (s *ProductItemImage) Map() map[string]any {
	return map[string]any{
		"id":          s.ID,
		"item_id":     s.ItemID,
		"url":         s.Url,
		"description": s.Description,
		"is_primary":  s.IsPrimary,
		"uploaded_at": s.UploadedAt,
		"uploaded_by": s.UploadedBy,
	}
}

func (s *ProductItemImage) Option() types.Option {
	return types.Option{
		Label: s.Url,
		Value: s.ID,
	}
}
