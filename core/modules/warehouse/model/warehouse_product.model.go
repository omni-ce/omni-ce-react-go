package model

import (
	"time"

	product "react-go/core/modules/product/model"

	"github.com/google/uuid"
)

type WarehouseProduct struct {
	ID                  uint `json:"id" gorm:"autoIncrement;primaryKey"`
	WarehouseLocationID uint `json:"warehouse_location_id" gorm:"type:integer;not null"`
	ProductID           uint `json:"product_id" gorm:"type:integer;not null"`
	Qty                 int  `json:"qty" gorm:"type:integer;not null"`
	IsActive            bool `json:"is_active" gorm:"default:true"`

	// relations
	WarehouseLocation WarehouseLocation   `json:"warehouse_location" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Product           product.ProductItem `json:"product" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"not null"`
}

func (s *WarehouseProduct) Map() map[string]any {
	return map[string]any{
		"id":                    s.ID,
		"warehouse_location_id": s.WarehouseLocationID,
		"product_id":            s.ProductID,
		"qty":                   s.Qty,
		"is_active":             s.IsActive,
		"created_at":            s.CreatedAt,
		"updated_at":            s.UpdatedAt,
	}
}
