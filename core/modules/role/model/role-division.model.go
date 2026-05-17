package model

import (
	user "react-go/core/modules/user/model"
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
)

type RoleDivision struct {
	ID          uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	Name        string `json:"name" gorm:"type:varchar(50);uniqueIndex;not null"`
	Description string `json:"description" gorm:"type:varchar(255)"`
	IsActive    bool   `json:"is_active" gorm:"type:boolean;default:true"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created *user.User `json:"created" gorm:"foreignKey:CreatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated *user.User `json:"updated" gorm:"foreignKey:UpdatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *RoleDivision) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}

func (RoleDivision) Seed() []RoleDivision {
	return []RoleDivision{
		{ID: 1, Name: "Management", Description: "Internal Officer"},
	}
}
