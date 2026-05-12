package model

import (
	product "react-go/core/modules/product/model"
)

type SupplierProduct struct {
	ID         uint `json:"id" gorm:"autoIncrement;primaryKey"`
	SupplierID uint `json:"supplier_id" gorm:"not null"`
	ProductID  uint `json:"product_id" gorm:"not null"`
	IsActive   bool `json:"is_active" gorm:"default:true"`

	// relations
	Supplier SupplierEntity      `json:"supplier" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Product  product.ProductItem `json:"product" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *SupplierProduct) Map() map[string]any {
	return map[string]any{
		"id":          s.ID,
		"supplier_id": s.SupplierID,
		"product_id":  s.ProductID,
		"is_active":   s.IsActive,
	}
}
