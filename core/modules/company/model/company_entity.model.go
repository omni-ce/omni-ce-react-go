package model

import (
	"react-go/core/types"
	"time"
)

type CompanyEntity struct {
	ID          uint      `json:"id" gorm:"autoIncrement;primaryKey"`
	Logo        string    `json:"logo" gorm:"type:varchar(255);not null"`
	Name        string    `json:"name" gorm:"type:varchar(255);not null"`
	NpwpCode    string    `json:"npwp_code" gorm:"type:varchar(255);not null"`
	IsTaxPayer  bool      `json:"is_taxpayer" gorm:"type:boolean;not null"`
	NpwpAlias   string    `json:"npwp_alias" gorm:"type:varchar(255);not null"`
	Address     string    `json:"address" gorm:"type:text;not null"`
	AddressCode string    `json:"address_code" gorm:"type:varchar(255);not null"`
	IsActive    bool      `json:"is_active" gorm:"type:boolean;not null"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy   uint      `json:"created_by" gorm:"not null"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy   uint      `json:"updated_by" gorm:"not null"`
}

func (s *CompanyEntity) Map() map[string]any {
	return map[string]any{
		"id":           s.ID,
		"logo":         s.Logo,
		"name":         s.Name,
		"npwp_code":    s.NpwpCode,
		"is_taxpayer":  s.IsTaxPayer,
		"npwp_alias":   s.NpwpAlias,
		"address":      s.Address,
		"address_code": s.AddressCode,
		"is_active":    s.IsActive,
		"created_at":   s.CreatedAt,
		"created_by":   s.CreatedBy,
		"updated_at":   s.UpdatedAt,
		"updated_by":   s.UpdatedBy,
	}
}

func (s *CompanyEntity) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}
