package model

import (
	role "react-go/modules/role/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DashboardComponent struct {
	ID           uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	RoleID       uint      `json:"role_id" gorm:"type:bigint;not null;uniqueIndex:idx_dashboard_component_key"`
	ComponentKey string    `json:"component_key" gorm:"type:varchar(255);not null;uniqueIndex:idx_dashboard_component_key"`
	Key          string    `json:"key" gorm:"type:varchar(255);not null;uniqueIndex:idx_dashboard_component_key"`
	Type         string    `json:"type" gorm:"type:varchar(255);not null"`
	Col          int       `json:"col" gorm:"type:int;not null;default:12"`
	Label        string    `json:"label" gorm:"type:varchar(255);not null"`
	Description  string    `json:"description" gorm:"type:varchar(255)"`
	Value        float64   `json:"value" gorm:"type:decimal(10,2);not null;default:0"`
	// relations
	Role role.Role `json:"role" gorm:"foreignKey:RoleID;references:ID;constraint:OnDelete:CASCADE"`
}

func (a *DashboardComponent) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		uuidV7, _ := uuid.NewV7()
		a.ID = uuidV7
	}
	return nil
}

func (s *DashboardComponent) Map() map[string]any {
	return map[string]any{
		"id":      s.ID,
		"role_id": s.RoleID,
		"key":     s.Key,
		"value":   s.Value,
	}
}
