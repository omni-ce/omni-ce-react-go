package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Setting struct {
	ID    uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	Key   string    `json:"key" gorm:"uniqueIndex"`
	Value string    `json:"value" gorm:"type:text"`
}

func (s *Setting) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func (Setting) Seed() []Setting {
	return []Setting{
		{
			Key:   "maintenance_mode",
			Value: "false",
		},
	}
}
