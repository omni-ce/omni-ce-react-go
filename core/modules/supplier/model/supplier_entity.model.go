package model

import (
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SupplierEntity struct {
	ID        uint    `json:"id" gorm:"autoIncrement;primaryKey"`
	Name      string  `json:"name" gorm:"type:varchar(128);not null"`
	Address   string  `json:"address" gorm:"type:text;not null"`
	Phone     string  `json:"phone" gorm:"type:varchar(32);not null"`
	Email     string  `json:"email" gorm:"type:varchar(128);not null"`
	Longitude float64 `json:"longitude" gorm:"type:float;not null"`
	Latitude  float64 `json:"latitude" gorm:"type:float;not null"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"not null"`
}

func (s *SupplierEntity) Map() map[string]any {
	return map[string]any{
		"id":         s.ID,
		"name":       s.Name,
		"address":    s.Address,
		"phone":      s.Phone,
		"email":      s.Email,
		"longitude":  s.Longitude,
		"latitude":   s.Latitude,
		"created_at": s.CreatedAt,
		"created_by": s.CreatedBy,
		"updated_at": s.UpdatedAt,
		"updated_by": s.UpdatedBy,
	}
}

func (SupplierEntity) Seed(db *gorm.DB) {
	var count int64
	db.Model(&SupplierEntity{}).Count(&count)

	if count == 0 {
		stats := []SupplierEntity{}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ SupplierEntity seeded")
	} else {
		log.Println("⚠️ SupplierEntity already seeded")
	}
}
