package model

import (
	"log"
	"react-go/core/types"

	"gorm.io/gorm"
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

func (Unit) Seed(db *gorm.DB) {
	var count int64
	db.Model(&Unit{}).Count(&count)

	if count == 0 {
		stats := []Unit{
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

		for _, s := range stats {
			db.Create(&s)
		}

		log.Println("✅ Example seeded")
	} else {
		log.Println("⚠️ Example already seeded")
	}
}
