package model

import (
	"react-go/core/types"
)

type Unit struct {
	ID        uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	Name      string `json:"name" gorm:"type:varchar(100);not null"`
	ShortName string `json:"short_name" gorm:"type:varchar(100);not null"`

	// flags
	IsWeight    bool `json:"is_weight" gorm:"type:boolean;not null;default:false"`
	IsMeasure   bool `json:"is_measure" gorm:"type:boolean;not null;default:false"`
	IsLiquidity bool `json:"is_liquidity" gorm:"type:boolean;not null;default:false"`
	IsCount     bool `json:"is_count" gorm:"type:boolean;not null;default:false"`
}

func (s *Unit) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}

func (Unit) Seed() []Unit {
	return []Unit{
		{
			Name:      "Kilogram",
			ShortName: "Kg",
			IsWeight:  true,
		},
		{
			Name:      "Gram",
			ShortName: "Gr",
			IsWeight:  true,
		},
		{
			Name:        "Liter",
			ShortName:   "Ltr",
			IsLiquidity: true,
		},
		{
			Name:        "Milliliter",
			ShortName:   "Ml",
			IsLiquidity: true,
		},
		{
			Name:      "Meter",
			ShortName: "Mtr",
			IsMeasure: true,
		},
		{
			Name:      "Centimeter",
			ShortName: "Cm",
			IsMeasure: true,
		},
		{
			Name:      "Pcs",
			ShortName: "Pcs",
			IsCount:   true,
		},
		{
			Name:      "Unit",
			ShortName: "Unit",
			IsCount:   true,
		},
		{
			Name:      "Pair",
			ShortName: "Pair",
			IsCount:   true,
		},
		{
			Name:      "Box",
			ShortName: "Box",
			IsCount:   true,
		},
	}
}
