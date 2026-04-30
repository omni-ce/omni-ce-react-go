package model

import (
	"log"
	"time"

	"gorm.io/gorm"
)

type Role struct {
	ID          uint      `json:"id" gorm:"autoIncrement;primaryKey"`
	Name        string    `json:"name" gorm:"type:varchar(50);uniqueIndex;not null"`
	Description string    `json:"description" gorm:"type:varchar(255)"`
	IsActive    bool      `json:"is_active" gorm:"type:boolean;default:true"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}

func (Role) Seed(db *gorm.DB) {
	var count int64
	db.Model(&Role{}).Count(&count)

	if count == 0 {
		roles := []Role{
			{Name: "Admin", Description: "Full access"},
			{Name: "Operator", Description: "Limited access"},
		}

		for _, r := range roles {
			db.Create(&r)
		}

		log.Println("✅ Roles seeded")
	} else {
		log.Println("⚠️  Roles already seeded")
	}
}
