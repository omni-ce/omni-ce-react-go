package model

import (
	user "react-go/modules/user/model"

	"github.com/google/uuid"
)

type RoleUser struct {
	ID     uint      `json:"id" gorm:"autoIncrement;primaryKey"`
	RoleID uint      `json:"role_id" gorm:"type:bigint;not null;uniqueIndex:idx_role_user_role_id_user_id"`
	UserID uuid.UUID `json:"user_id" gorm:"type:char(36);not null;uniqueIndex:idx_role_user_role_id_user_id"`
	// relations
	Role Role      `json:"role" gorm:"foreignKey:RoleID;references:ID;constraint:OnDelete:CASCADE"`
	User user.User `json:"user" gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE"`
}
