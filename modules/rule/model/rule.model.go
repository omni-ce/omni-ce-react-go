package model

import (
	"log"

	role "react-go/modules/role/model"

	"gorm.io/gorm"
)

type Rule struct {
	ID     uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	RoleID uint   `json:"role_id" gorm:"type:bigint;not null;uniqueIndex:idx_role_menu_key_role_action"`
	Key    string `json:"key" gorm:"uniqueIndex:idx_role_menu_key_role_action"`
	Action string `json:"action" gorm:"uniqueIndex:idx_role_menu_key_role_action"` // create, read, update, delete, set
	State  bool   `json:"state" gorm:"default:true"`
	// relations
	Role role.Role `json:"role" gorm:"foreignKey:RoleID;references:ID;onDelete:CASCADE"`
}

func (s *Rule) Map() map[string]any {
	return map[string]any{
		"id":      s.ID,
		"role_id": s.RoleID,
		"key":     s.Key,
		"action":  s.Action,
		"state":   s.State,
	}
}

func (Rule) Seed(db *gorm.DB) {
	var count int64
	db.Model(&Rule{}).Count(&count)

	if count == 0 {
		stats := []Rule{
			{RoleID: 1, Key: "role", Action: "read"},
			{RoleID: 1, Key: "role", Action: "create"},
			{RoleID: 1, Key: "role", Action: "update"},
			{RoleID: 1, Key: "role", Action: "delete"},
			{RoleID: 1, Key: "user", Action: "read"},
			{RoleID: 1, Key: "user", Action: "create"},
			{RoleID: 1, Key: "user", Action: "update"},
			{RoleID: 1, Key: "user", Action: "delete"},
			{RoleID: 1, Key: "master_data", Action: "read"},
			{RoleID: 1, Key: "master_data", Action: "create"},
			{RoleID: 1, Key: "master_data", Action: "update"},
			{RoleID: 1, Key: "master_data", Action: "delete"},
		}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Example seeded")
	} else {
		log.Println("⚠️ Example already seeded")
	}
}
