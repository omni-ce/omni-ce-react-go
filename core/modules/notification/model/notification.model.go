package model

import (
	"encoding/json"
	"time"

	user "react-go/core/modules/user/model"

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
	ID     uint      `json:"id" gorm:"autoIncrement;primaryKey"`
	UserID uuid.UUID `json:"user_id" gorm:"type:char(36);not null"`

	Type     string     `json:"type" gorm:"type:varchar(20)"`
	Title    string     `json:"title" gorm:"type:text"`
	Message  string     `json:"message" gorm:"type:text"`
	Link     string     `json:"link,omitempty" gorm:"type:varchar(255);default:null"`     // new tab
	Navigate string     `json:"navigate,omitempty" gorm:"type:varchar(255);default:null"` // react router
	IsRead   bool       `json:"is_read" gorm:"type:boolean;default:false"`
	ReadAt   *time.Time `json:"read_at" gorm:"default:null"`

	// relations
	User user.User `json:"user" gorm:"foreignKey:UserID;references:ID;onDelete:CASCADE"`

	// SLA: create & update by user
	CreatedAt time.Time  `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID  `json:"created_by" gorm:"type:char(36);not null"`
	DeletedAt *time.Time `json:"-" gorm:"index;column:deleted_at;null"`
	DeletedBy *uuid.UUID `json:"deleted_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Deleted user.User `json:"deleted" gorm:"foreignKey:DeletedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *Notification) Map() map[string]any {
	var titleMap map[string]string
	if err := json.Unmarshal([]byte(s.Title), &titleMap); err != nil {
		titleMap = map[string]string{"id": s.Title, "en": s.Title}
	}

	var messageMap map[string]string
	if err := json.Unmarshal([]byte(s.Message), &messageMap); err != nil {
		messageMap = map[string]string{"id": s.Message, "en": s.Message}
	}

	return map[string]any{
		"id":         s.ID,
		"type":       s.Type,
		"title":      titleMap,
		"message":    messageMap,
		"is_read":    s.IsRead,
		"link":       s.Link,
		"navigate":   s.Navigate,
		"created_at": s.CreatedAt,
		"read_at":    s.ReadAt,
	}
}
