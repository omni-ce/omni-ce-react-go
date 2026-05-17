package model

import (
	"react-go/core/function/hash"
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	UserRoleSuperAdmin = "su"
	UserRoleUser       = "user"
)

type User struct {
	ID          uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	Username    string    `json:"username" gorm:"uniqueIndex"`
	Password    string    `json:"password" gorm:"not null"`
	Role        string    `json:"role" gorm:"not null"`
	Name        string    `json:"name" gorm:"not null"`
	Avatar      string    `json:"avatar"`
	Address     string    `json:"address"`
	PhoneNumber string    `json:"phone_number"`
	Email       string    `json:"email"`
	IsActive    bool      `json:"is_active" gorm:"not null;default:true"`

	// SLA: create & update by user
	CreatedAt       time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedByUserID uuid.UUID `json:"created_by" gorm:"column:created_by_user_id;type:char(36);not null"`
	UpdatedAt       time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedByUserID uuid.UUID `json:"updated_by" gorm:"column:updated_by_user_id;type:char(36);not null"`

	// relations
	Created *User `json:"created" gorm:"foreignKey:CreatedByUserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated *User `json:"updated" gorm:"foreignKey:UpdatedByUserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *User) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		uuidV7, _ := uuid.NewV7()
		s.ID = uuidV7
	}
	return nil
}

func (s *User) Map() map[string]any {
	return map[string]any{
		"id":           s.ID,
		"username":     s.Username,
		"role":         s.Role,
		"name":         s.Name,
		"email":        s.Email,
		"avatar":       s.Avatar,
		"address":      s.Address,
		"phone_number": s.PhoneNumber,
		"is_active":    s.IsActive,
		"created_at":   s.CreatedAt,
	}
}

func (s *User) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}

func (User) Seed() []User {
	adminId, _ := uuid.NewV7()
	users := []User{
		{
			ID:              adminId,
			Name:            "Super Admin",
			Username:        "super_admin",
			Password:        hash.Password("SuperAdmin@123"),
			Role:            UserRoleSuperAdmin,
			CreatedByUserID: adminId,
			UpdatedByUserID: adminId,
		},
	}
	return users
}
