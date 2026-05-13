package model

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	user "react-go/core/modules/user/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApiKey struct {
	ID        uuid.UUID  `json:"id" gorm:"type:char(36);primaryKey"`
	Name      string     `json:"name" gorm:"not null"`
	Key       string     `json:"key" gorm:"uniqueIndex;not null"`
	IsActive  bool       `json:"is_active" gorm:"default:true"`
	ExpiresAt *time.Time `json:"expires_at,omitempty" gorm:"default:null"`
	LastUsed  *time.Time `json:"last_used,omitempty" gorm:"default:null"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (a *ApiKey) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		uuidV7, _ := uuid.NewV7()
		a.ID = uuidV7
	}
	if a.Key == "" {
		a.Key = generateKey()
	}
	return nil
}

func generateKey() string {
	b := make([]byte, 32)
	rand.Read(b)
	return "api_" + hex.EncodeToString(b)
}
