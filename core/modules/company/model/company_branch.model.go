package model

import (
	user "react-go/core/modules/user/model"
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
)

type CompanyBranch struct {
	ID          uint      `json:"id" gorm:"autoIncrement;primaryKey"`
	EntityID    uint      `json:"entity_id" gorm:"not null"`
	PicID       uuid.UUID `json:"pic_id" gorm:"not null"`
	Code        string    `json:"code" gorm:"type:varchar(255);not null"`
	Name        string    `json:"name" gorm:"type:varchar(255);not null"`
	AliasCode   string    `json:"alias_code" gorm:"type:varchar(255);not null"`
	Address     string    `json:"address" gorm:"type:text;not null"`
	AddressCode string    `json:"address_code" gorm:"type:varchar(255);not null"`
	Phone       string    `json:"phone" gorm:"type:varchar(255);not null"`
	Longitude   float64   `json:"longitude" gorm:"type:float;not null"`
	Latitude    float64   `json:"latitude" gorm:"type:float;not null"`
	IsActive    bool      `json:"is_active" gorm:"type:boolean;not null"`

	// relations
	Entity CompanyEntity `json:"entity" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Pic    user.User     `json:"pic" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`
}

func (s *CompanyBranch) Map() map[string]any {
	return map[string]any{
		"id":           s.ID,
		"entity_id":    s.EntityID,
		"pic_id":       s.PicID,
		"code":         s.Code,
		"name":         s.Name,
		"alias_code":   s.AliasCode,
		"address":      s.Address,
		"address_code": s.AddressCode,
		"phone":        s.Phone,
		"longitude":    s.Longitude,
		"latitude":     s.Latitude,
		"is_active":    s.IsActive,
		"created_at":   s.CreatedAt,
		"created_by":   s.CreatedBy,
		"updated_at":   s.UpdatedAt,
		"updated_by":   s.UpdatedBy,
	}
}

func (s *CompanyBranch) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}
