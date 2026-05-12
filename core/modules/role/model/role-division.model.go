package model

import (
	"log"
	user "react-go/core/modules/user/model"
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
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
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *RoleDivision) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}

func (RoleDivision) Seed(db *gorm.DB) {
	var count int64
	db.Model(&RoleDivision{}).Count(&count)

	if count == 0 {
		roles := []RoleDivision{
			{ID: 1, Name: "Management", Description: "Internal Officer"},
		}

		for _, r := range roles {
			db.Create(&r)
		}

		log.Println("✅ Role Divisions seeded")
	} else {
		log.Println("⚠️  Role Divisions already seeded")
	}
}
