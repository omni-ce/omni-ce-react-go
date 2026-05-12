package model

type Unit struct {
	ID        uint   `json:"id" gorm:"autoIncrement;primaryKey"`
	Name      string `json:"name" gorm:"type:varchar(100);not null"`
	ShortName string `json:"short_name" gorm:"type:varchar(100);not null"`
}
