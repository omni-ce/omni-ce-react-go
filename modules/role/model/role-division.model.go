package model

import (
	"log"
	"react-go/types"
	"time"

	"gorm.io/gorm"
)

type RoleDivision struct {
	ID          uint      `json:"id" gorm:"autoIncrement;primaryKey"`
	Name        string    `json:"name" gorm:"type:varchar(50);uniqueIndex;not null"`
	Description string    `json:"description" gorm:"type:varchar(255)"`
	IsActive    bool      `json:"is_active" gorm:"type:boolean;default:true"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}

func (s *RoleDivision) Option() types.Option {
	return types.Option{
		Key:   s.ID,
		Value: s.Name,
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
