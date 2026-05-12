package model

import "react-go/core/types"

type Unit struct {
	ID        uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	Name      string `json:"name" gorm:"type:varchar(100);not null"`
	ShortName string `json:"short_name" gorm:"type:varchar(100);not null"`
}

func (s *Unit) Option() types.Option {
	return types.Option{
		Label: s.Name,
		Value: s.ID,
	}
}
