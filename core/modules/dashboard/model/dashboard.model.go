package model

import (
	role "react-go/core/modules/role/model"
	user "react-go/core/modules/user/model"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DashboardWidget struct {
	ID     uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	RoleID uint      `json:"role_id" gorm:"type:bigint;not null;uniqueIndex:idx_dashboard_role_function_type"`

	Type        string `json:"type" gorm:"type:varchar(255);not null;uniqueIndex:idx_dashboard_role_function_type"`
	FunctionKey string `json:"function_key" gorm:"type:varchar(255);not null;uniqueIndex:idx_dashboard_role_function_type"`
	Col         string `json:"col" gorm:"type:text;not null"`
	Label       string `json:"label" gorm:"type:varchar(255);not null"`
	Description string `json:"description" gorm:"type:varchar(255)"`
	// optional fields
	Icon    string `json:"icon,omitempty" gorm:"type:varchar(255)"`
	Color   string `json:"color,omitempty" gorm:"type:varchar(255)"`
	BgColor string `json:"bg_color,omitempty" gorm:"type:varchar(255)"`

	// relations
	Role role.Role `json:"role" gorm:"foreignKey:RoleID;references:ID;constraint:OnDelete:CASCADE"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (a *DashboardWidget) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		uuidV7, _ := uuid.NewV7()
		a.ID = uuidV7
	}
	return nil
}

func (s *DashboardWidget) Map() map[string]any {
	return map[string]any{
		"id":           s.ID,
		"role_id":      s.RoleID,
		"type":         s.Type,
		"function_key": s.FunctionKey,
		"col":          s.Col,
		"label":        s.Label,
		"description":  s.Description,
		"icon":         s.Icon,
		"color":        s.Color,
		"bg_color":     s.BgColor,
	}
}
