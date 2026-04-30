package model

import (
	"log"
	"react-go/types"
	"time"

	"gorm.io/gorm"
)

type Role struct {
	ID             uint      `json:"id" gorm:"autoIncrement;primaryKey"`
	RoleDivisionID uint      `json:"role_division_id" gorm:"type:bigint;not null"`
	Name           string    `json:"name" gorm:"type:varchar(50);uniqueIndex;not null"`
	Description    string    `json:"description" gorm:"type:varchar(255)"`
	IsActive       bool      `json:"is_active" gorm:"type:boolean;default:true"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	// relations
	RoleDivision RoleDivision `json:"role_division" gorm:"foreignKey:RoleDivisionID;references:ID;constraint:OnDelete:CASCADE"`
}

func (s *Role) Option() types.Option {
	return types.Option{
		Key:   s.ID,
		Value: s.Name,
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
