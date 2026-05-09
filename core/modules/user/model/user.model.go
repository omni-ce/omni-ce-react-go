package model

import (
	"log"
	"react-go/core/function/hash"
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	UserRoleAdmin  = "su"
	UserRoleClient = "user"
)

type User struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex"`
	Password  string    `json:"password" gorm:"not null"`
	Role      string    `json:"role" gorm:"not null"`
	Name      string    `json:"name" gorm:"not null"`
	Avatar    string    `json:"avatar"`
	Address   string    `json:"address"`
	IsActive  bool      `json:"is_active" gorm:"not null;default:true"`
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
		"username":   s.Username,
		"role":       s.Role,
		"name":       s.Name,
		"avatar":     s.Avatar,
		"address":    s.Address,
		"is_active":  s.IsActive,
		"created_at": s.CreatedAt,
	}
}

func (s *User) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
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
