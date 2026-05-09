package model

import (
	"react-go/core/types"
	"time"

	"github.com/google/uuid"
)

type ProductItem struct {
	ID         uint  `json:"id" gorm:"autoIncrement;primaryKey"`
	CategoryID uint  `json:"category_id" gorm:"not null"`
	TypeID     uint  `json:"type_id" gorm:"not null"`
	BrandID    uint  `json:"brand_id" gorm:"not null"`
	VariantID  uint  `json:"varian_id" gorm:"not null"`
	MemoryID   *uint `json:"memory_id" gorm:"default:null"`
	ColorID    uint  `json:"color_id" gorm:"not null"`
	IsActive   bool  `json:"is_active" gorm:"default:true"`

	// StockKeeping Unit
	SKU     string `json:"sku" gorm:"type:varchar(255);uniqueIndex;not null"`
	SkuIMEI string `json:"sku_imei" gorm:"type:varchar(255);default:null"`

	// relations
	Category ProductCategory `json:"category" gorm:"foreignKey:CategoryID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Type     ProductType     `json:"type" gorm:"foreignKey:TypeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Brand    ProductBrand    `json:"brand" gorm:"foreignKey:BrandID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Variant  ProductVariant  `json:"varian" gorm:"foreignKey:VariantID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Memory   ProductMemory   `json:"memory" gorm:"foreignKey:MemoryID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Color    ProductColor    `json:"color" gorm:"foreignKey:ColorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// SLA: create & update by user
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	CreatedBy uuid.UUID `json:"created_by" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"not null"`
}

func (s *ProductItem) Map() map[string]any {
	return map[string]any{
		"id":          s.ID,
		"category_id": s.CategoryID,
		"brand_id":    s.BrandID,
		"varian_id":   s.VariantID,
		"memory_id":   s.MemoryID,
		"color_id":    s.ColorID,
		"sku":         s.SKU,
		"sku_imei":    s.SkuIMEI,
		"is_active":   s.IsActive,
		"created_at":  s.CreatedAt,
		"created_by":  s.CreatedBy,
		"updated_at":  s.UpdatedAt,
		"updated_by":  s.UpdatedBy,
	}
}

func (s *ProductItem) Option() types.Option {
	return types.Option{
		Label: s.SKU,
		Value: s.ID,
	}
}
