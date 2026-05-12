package model

import (
	"log"
	user "react-go/core/modules/user/model"
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role struct {
	ID             uint `json:"id" gorm:"autoIncrement;primaryKey"`
	RoleDivisionID uint `json:"role_division_id" gorm:"type:bigint;not null"`

	Name        string `json:"name" gorm:"type:varchar(50);uniqueIndex;not null"`
	Description string `json:"description" gorm:"type:varchar(255)"`
	IsActive    bool   `json:"is_active" gorm:"type:boolean;default:true"`

	// relations
	RoleDivision RoleDivision `json:"role_division" gorm:"foreignKey:RoleDivisionID;references:ID;constraint:OnDelete:CASCADE"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *Role) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}

func (Role) Seed(db *gorm.DB) {
	var count int64
	db.Model(&Role{}).Count(&count)

	if count == 0 {
		roles := []Role{
			{ID: 1, RoleDivisionID: 1, Name: "Admin", Description: "Full access"},
			{ID: 2, RoleDivisionID: 1, Name: "Operator", Description: "Limited access"},
		}

		for _, r := range roles {
			db.Create(&r)
		}

		log.Println("✅ Roles seeded")
	} else {
		log.Println("⚠️  Roles already seeded")
	}
}
