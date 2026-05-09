package model

import (
	"fmt"
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
)

type ProductMemory struct {
	ID              uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	Key             string `json:"key" gorm:"type:varchar(255);uniqueIndex;not null"`
	Ram             int    `json:"ram" gorm:"type:integer;not null"`
	InternalStorage int    `json:"internal_storage" gorm:"type:integer;not null"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"not null"`
}

func (s *ProductMemory) Map() map[string]any {
	return map[string]any{
		"id":               s.ID,
		"key":              s.Key,
		"ram":              s.Ram,
		"internal_storage": s.InternalStorage,
		"created_at":       s.CreatedAt,
		"created_by":       s.CreatedBy,
		"updated_at":       s.UpdatedAt,
		"updated_by":       s.UpdatedBy,
	}
}

func (s *ProductMemory) Option() types.Option {
	return types.Option{
		Label: fmt.Sprintf("%d GB / %d GB", s.Ram, s.InternalStorage),
		Value: s.ID,
	}
}
