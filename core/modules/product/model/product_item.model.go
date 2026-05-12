package model

import (
	"react-go/core/types"
	"time"

	master_data "react-go/core/modules/master_data/model"
	user "react-go/core/modules/user/model"

	"github.com/google/uuid"
)

type ProductItem struct {
	ID           uint  `json:"id" gorm:"autoIncrement;primaryKey"`
	CategoryID   uint  `json:"category_id" gorm:"not null"`
	TypeID       uint  `json:"type_id" gorm:"not null"`
	BrandID      uint  `json:"brand_id" gorm:"not null"`
	VariantID    uint  `json:"varian_id" gorm:"not null"`
	MemoryID     *uint `json:"memory_id" gorm:"default:null"`
	ColorID      *uint `json:"color_id" gorm:"default:null"`
	ConditionID  uint  `json:"condition_id" gorm:"not null"`
	WeightUnitID uint  `json:"weight_unit_id" gorm:"not null"`

	Key      string  `json:"key" gorm:"type:varchar(255);uniqueIndex;not null"`
	Weight   float64 `json:"weight" gorm:"not null"`
	IsActive bool    `json:"is_active" gorm:"default:true"`

	// StockKeeping Unit
	SKU string `json:"sku" gorm:"type:varchar(255);uniqueIndex;not null"`

	// relations
	Category  ProductCategory  `json:"category" gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Type      ProductType      `json:"type" gorm:"foreignKey:TypeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Brand     ProductBrand     `json:"brand" gorm:"foreignKey:BrandID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Variant   ProductVariant   `json:"varian" gorm:"foreignKey:VariantID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Memory    ProductMemory    `json:"memory" gorm:"foreignKey:MemoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Color     ProductColor     `json:"color" gorm:"foreignKey:ColorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Condition ProductCondition `json:"condition" gorm:"foreignKey:ConditionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Unit      master_data.Unit `json:"unit" gorm:"foreignKey:WeightUnitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:char(36);not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:char(36);not null"`

	// relations
	Created user.User `json:"created" gorm:"foreignKey:CreatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Updated user.User `json:"updated" gorm:"foreignKey:UpdatedBy;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (s *ProductItem) Map() map[string]any {
	return map[string]any{
		"id":             s.ID,
		"category_id":    s.CategoryID,
		"type_id":        s.TypeID,
		"brand_id":       s.BrandID,
		"varian_id":      s.VariantID,
		"memory_id":      s.MemoryID,
		"color_id":       s.ColorID,
		"condition_id":   s.ConditionID,
		"weight":         s.Weight,
		"weight_unit_id": s.WeightUnitID,
		"sku":            s.SKU,
		"is_active":      s.IsActive,
		"created_at":     s.CreatedAt,
		"created_by":     s.CreatedBy,
		"updated_at":     s.UpdatedAt,
		"updated_by":     s.UpdatedBy,
	}
}

func (s *ProductItem) Option() types.Option {
	return types.Option{
		Label: s.SKU,
		Value: s.ID,
	}
}
