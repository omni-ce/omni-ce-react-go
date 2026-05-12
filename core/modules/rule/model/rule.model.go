package model

import (
	"log"

	role "react-go/core/modules/role/model"

	"gorm.io/gorm"
)

type Rule struct {
	ID     uint `json:"id" gorm:"autoIncrement;primaryKey"`
	RoleID uint `json:"role_id" gorm:"type:bigint;not null;uniqueIndex:idx_role_menu_key_role_action"`

	Key    string `json:"key" gorm:"uniqueIndex:idx_role_menu_key_role_action"`
	Action string `json:"action" gorm:"uniqueIndex:idx_role_menu_key_role_action"` // create, read, update, delete, set
	State  bool   `json:"state" gorm:"default:false"`

	// relations
	Role role.Role `json:"role" gorm:"foreignKey:RoleID;references:ID;constraint:OnDelete:CASCADE"`
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
			{RoleID: 1, Key: "roles", Action: "read", State: true},
			{RoleID: 1, Key: "roles", Action: "create", State: true},
			{RoleID: 1, Key: "roles", Action: "update", State: true},
			{RoleID: 1, Key: "roles", Action: "delete", State: true},
			{RoleID: 1, Key: "roles", Action: "set", State: true},
			{RoleID: 1, Key: "users", Action: "read", State: true},
			{RoleID: 1, Key: "users", Action: "create", State: true},
			{RoleID: 1, Key: "users", Action: "update", State: true},
			{RoleID: 1, Key: "users", Action: "delete", State: true},
			{RoleID: 1, Key: "users", Action: "set", State: true},
			{RoleID: 1, Key: "master-data", Action: "read", State: true},
			{RoleID: 1, Key: "master-data", Action: "create", State: true},
			{RoleID: 1, Key: "master-data", Action: "update", State: true},
			{RoleID: 1, Key: "master-data", Action: "delete", State: true},
			{RoleID: 1, Key: "master-data", Action: "set", State: true},
		}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Example seeded")
	} else {
		log.Println("⚠️ Example already seeded")
	}
}
