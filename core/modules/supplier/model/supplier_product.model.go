package model

import (
	"time"

	product "react-go/core/modules/product/model"
	user "react-go/core/modules/user/model"

	"github.com/google/uuid"
)

type SupplierProduct struct {
	ID         uint `json:"id" gorm:"autoIncrement;primaryKey"`
	SupplierID uint `json:"supplier_id" gorm:"not null"`
	ProductID  uint `json:"product_id" gorm:"not null"`
	IsActive   bool `json:"is_active" gorm:"default:true"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Supplier SupplierEntity      `json:"supplier" gorm:"foreignKey:SupplierID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Product  product.ProductItem `json:"product" gorm:"foreignKey:ProductID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Created  *user.User          `json:"created" gorm:"foreignKey:CreatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated  *user.User          `json:"updated" gorm:"foreignKey:UpdatedBy;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *SupplierProduct) Map() map[string]any {
	res := map[string]any{
		"id":          s.ID,
		"supplier_id": s.SupplierID,
		"product_id":  s.ProductID,
		"is_active":   s.IsActive,
		"created_at":  s.CreatedAt,
		"created_by":  s.CreatedBy,
		"updated_at":  s.UpdatedAt,
		"updated_by":  s.UpdatedBy,
	}

	if s.Created != nil {
		res["created"] = s.Created.Map()
	}
	if s.Updated != nil {
		res["updated"] = s.Updated.Map()
	}

	return res
}

func (SupplierProduct) Seed() []SupplierProduct {
	return []SupplierProduct{}
}
