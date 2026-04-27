package model

import (
	"log"
	"react-go/function/hash"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	UserRoleAdmin  = "admin"
	UserRoleClient = "client"
)

type User struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Avatar    string    `json:"avatar"`
	Username  string    `json:"username" gorm:"uniqueIndex"`
	Password  string    `json:"password" gorm:"not null"`
	Role      string    `json:"role" gorm:"not null"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
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
		"id":         s.ID,
		"name":       s.Name,
		"avatar":     s.Avatar,
		"username":   s.Username,
		"role":       s.Role,
		"created_at": s.CreatedAt,
	}
}

func (User) Seed(db *gorm.DB) {
	var count int64
	db.Model(&User{}).Count(&count)

	if count == 0 {
		stats := []User{
			{
				Name:     "Admin",
				Username: "admin",
				Password: hash.Password("admin123"),
				Role:     UserRoleAdmin,
			},
		}

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Users seeded")
	} else {
		log.Println("⚠️  Users already seeded")
	}
}
