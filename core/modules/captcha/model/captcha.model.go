package captcha

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Captcha struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	Captcha   string    `json:"captcha" gorm:"type:varchar(10)"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

func (m *Captcha) TableName() string {
	return "captcha"
}

func (m *Captcha) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
