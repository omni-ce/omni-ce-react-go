package model

import (
	user "react-go/core/modules/user/model"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Whitelist struct {
	ID    uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	Type  string    `json:"type" gorm:"not null"`              // "ip" or "domain"
	Value string    `json:"value" gorm:"uniqueIndex;not null"` // IP address or domain
	Label *string   `json:"label,omitempty" gorm:"default:null"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (w *Whitelist) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return nil
}
