package types

type Option struct {
	Label string `json:"label"`
	Value any    `json:"value"`
	Array *[]any `json:"array,omitempty"`
	Meta  *any   `json:"meta,omitempty"`
}
