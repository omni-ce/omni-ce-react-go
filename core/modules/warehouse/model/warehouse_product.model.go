package model

import (
	"os/user"
	"time"

	product "react-go/core/modules/product/model"

	"github.com/google/uuid"
)

type WarehouseProduct struct {
	ID                  uint `json:"id" gorm:"autoIncrement;primaryKey"`
	WarehouseLocationID uint `json:"warehouse_location_id" gorm:"type:bigint;uniqueIndex:idx_warehouse_product;not null"`
	ProductID           uint `json:"product_id" gorm:"type:bigint;uniqueIndex:idx_warehouse_product;not null"`

	Qty      int  `json:"qty" gorm:"type:integer;not null"`
	IsActive bool `json:"is_active" gorm:"default:true"`

	// relations
	WarehouseLocation WarehouseLocation   `json:"warehouse_location" gorm:"foreignKey:WarehouseLocationID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Product           product.ProductItem `json:"product" gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
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
