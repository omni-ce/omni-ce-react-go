package model

import (
	user "react-go/modules/user/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RoleUser struct {
	ID     uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	RoleID uint      `json:"role_id" gorm:"type:bigint;not null;uniqueIndex:idx_role_user_role_id_user_id"`
	UserID uuid.UUID `json:"user_id" gorm:"type:char(36);not null;uniqueIndex:idx_role_user_role_id_user_id"`
	// relations
	Role Role      `json:"role" gorm:"foreignKey:RoleID;references:ID;constraint:OnDelete:CASCADE"`
	User user.User `json:"user" gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE"`
}

func (s *RoleUser) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		uuidV7, _ := uuid.NewV7()
		s.ID = uuidV7
	}
	return nil
}
