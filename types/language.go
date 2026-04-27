package types

const (
	LanguageCodeEN string = "en"
	LanguageCodeID string = "id"
)

type Language struct {
	En string `json:"en"`
	Id string `json:"id"`
}
