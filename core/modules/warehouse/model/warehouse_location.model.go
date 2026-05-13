package model

import (
	user "react-go/core/modules/user/model"
	"time"

	company "react-go/core/modules/company/model"
	role "react-go/core/modules/role/model"
	"react-go/core/types"

	"github.com/google/uuid"
)

type WarehouseLocation struct {
	ID       uint `json:"id" gorm:"autoIncrement;primaryKey"`
	BranchID uint `json:"branch_id" gorm:"type:bigint;not null"`
	RoleID   uint `json:"role_id" gorm:"type:bigint;not null"`

	Name      string  `json:"name" gorm:"type:varchar(255)"`
	Longitude float64 `json:"longitude" gorm:"type:decimal(10,8)"`
	Latitude  float64 `json:"latitude" gorm:"type:decimal(10,8)"`
	IsActive  bool    `json:"is_active" gorm:"default:true"`

	// relations
	Branch company.CompanyBranch `json:"branch" gorm:"foreignKey:BranchID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Role   role.Role             `json:"role" gorm:"foreignKey:RoleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *WarehouseLocation) Map() map[string]any {
	return map[string]any{
		"id":         s.ID,
		"name":       s.Name,
		"longitude":  s.Longitude,
		"latitude":   s.Latitude,
		"branch_id":  s.BranchID,
		"role_id":    s.RoleID,
		"is_active":  s.IsActive,
		"created_at": s.CreatedAt,
		"updated_at": s.UpdatedAt,
	}
}

func (s *WarehouseLocation) Option() types.Option {
	return types.Option{
		Value: s.ID,
		Label: s.Name,
	}
}
