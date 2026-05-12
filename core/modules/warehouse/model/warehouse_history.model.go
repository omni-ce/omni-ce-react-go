package model

import (
	"os/user"
	"time"

	"github.com/google/uuid"
)

const (
	WarehouseHistoryIN  = "in"
	WarehouseHistoryOUT = "out"
)

type WarehouseHistory struct {
	ID                 uint `json:"id" gorm:"autoIncrement;primaryKey"`
	WarehouseProductID uint `json:"warehouse_product_id" gorm:"type:bigint;uniqueIndex:idx_warehouse_product;not null"`

	Type      string `json:"type" gorm:"type:varchar(10);not null"`
	Qty       int    `json:"qty" gorm:"type:integer;not null"`
	Reference string `json:"reference" gorm:"type:varchar(255);not null"`
	Note      string `json:"note" gorm:"type:text"`

	// relations
	WarehouseProduct WarehouseProduct `json:"warehouse_product" gorm:"foreignKey:WarehouseProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *WarehouseHistory) Map() map[string]any {
	return map[string]any{
		"id":                   s.ID,
		"warehouse_product_id": s.WarehouseProductID,
		"type":                 s.Type,
		"qty":                  s.Qty,
		"reference":            s.Reference,
		"note":                 s.Note,
		"created_at":           s.CreatedAt,
		"created_by":           s.CreatedBy,
		"updated_at":           s.UpdatedAt,
		"updated_by":           s.UpdatedBy,
	}
}
