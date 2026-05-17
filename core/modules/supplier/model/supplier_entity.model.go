package model

import (
	"time"

	user "react-go/core/modules/user/model"

	"github.com/google/uuid"
)

type SupplierEntity struct {
	ID          uint    `json:"id" gorm:"autoIncrement;primaryKey"`
	Name        string  `json:"name" gorm:"type:varchar(128);not null"`
	Phone       string  `json:"phone" gorm:"type:varchar(32);not null"`
	Email       string  `json:"email" gorm:"type:varchar(128);not null"`
	Address     string  `json:"address" gorm:"type:text;not null"`
	AddressCode string  `json:"address_code" gorm:"type:varchar(255);not null"`
	Longitude   float64 `json:"longitude" gorm:"type:float;not null"`
	Latitude    float64 `json:"latitude" gorm:"type:float;not null"`
	IsActive    bool    `json:"is_active" gorm:"default:true"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created *user.User `json:"created" gorm:"foreignKey:CreatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated *user.User `json:"updated" gorm:"foreignKey:UpdatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *SupplierEntity) Map() map[string]any {
	res := map[string]any{
		"id":           s.ID,
		"name":         s.Name,
		"address":      s.Address,
		"address_code": s.AddressCode,
		"phone":        s.Phone,
		"email":        s.Email,
		"map": map[string]any{
			"longitude": s.Longitude,
			"latitude":  s.Latitude,
		},
		"is_active":  s.IsActive,
		"created_at": s.CreatedAt,
		"created_by": s.CreatedBy,
		"updated_at": s.UpdatedAt,
		"updated_by": s.UpdatedBy,
	}

	if s.Created != nil {
		res["created"] = s.Created.Map()
	}
	if s.Updated != nil {
		res["updated"] = s.Updated.Map()
	}

	return res
}

func (SupplierEntity) Seed() []SupplierEntity {
	return []SupplierEntity{}
}
