package types

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

const (
	LanguageCodeEN string = "en"
	LanguageCodeID string = "id"
)

type Language struct {
	En string `json:"en"`
	Id string `json:"id"`
}

// Scan implements the sql.Scanner interface for GORM JSON columns
func (l *Language) Scan(value interface{}) error {
	if value == nil {
		*l = Language{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		str, ok := value.(string)
		if !ok {
			return fmt.Errorf("Language.Scan: unsupported type %T", value)
		}
		bytes = []byte(str)
	}
	return json.Unmarshal(bytes, l)
}

// Value implements the driver.Valuer interface for GORM JSON columns
func (l Language) Value() (driver.Value, error) {
	bytes, err := json.Marshal(l)
	if err != nil {
		return nil, err
	}
	return string(bytes), nil
}
