package types

type Option struct {
	Label string          `json:"label"`
	Value any             `json:"value"`
	Array *[]any          `json:"array,omitempty"`
	Meta  *map[string]any `json:"meta,omitempty"`
}
