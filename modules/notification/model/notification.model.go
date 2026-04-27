package model

import (
	"time"

	userModel "react-go/modules/user/model"
	"react-go/types"

	"github.com/google/uuid"
)

const (
	NotificationTypeInfo    string = "info"
	NotificationTypeSuccess string = "success"
	NotificationTypeWarning string = "warning"
	NotificationTypeError   string = "error"
	NotificationTypeSystem  string = "system"
)

type Notification struct {
	ID        uint           `json:"id" gorm:"autoIncrement;primaryKey"`
	UserID    uuid.UUID      `json:"user_id" gorm:"type:char(36);not null"`
	User      userModel.User `json:"-" gorm:"foreignKey:UserID;references:ID"`
	Type      string         `json:"type" gorm:"type:varchar(20)"`
	Title     types.Language  `json:"title" gorm:"type:json"`
	Message   types.Language  `json:"message" gorm:"type:json"`
	Link      string         `json:"link,omitempty" gorm:"type:varchar(255);default:null"`     // new tab
	Navigate  string         `json:"navigate,omitempty" gorm:"type:varchar(255);default:null"` // react router
	IsRead    bool           `json:"is_read" gorm:"type:boolean;default:false"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	ReadAt    *time.Time     `json:"read_at" gorm:"default:null"`
}

func (s *Notification) Map() map[string]any {
	return map[string]any{
		"id":         s.ID,
		"type":       s.Type,
		"title":      s.Title,
		"message":    s.Message,
		"is_read":    s.IsRead,
		"link":       s.Link,
		"navigate":   s.Navigate,
		"created_at": s.CreatedAt,
		"read_at":    s.ReadAt,
	}
}
