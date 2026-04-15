package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Access struct {
	ID       uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	IP       string    `json:"ip"`
	Country  string    `json:"country"`
	AccessAt time.Time `json:"access_at" gorm:"autoCreateTime"`
}

func (a *Access) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		uuidV7, _ := uuid.NewV7()
		a.ID = uuidV7
	}
	return nil
}
