package functions

import "react-go/core/types"

func TestProgressFunction(req types.FunctionRequest) any {
	return map[string]any{
		"items": []map[string]any{
			{"label": "Marketing", "value": 85, "amount": "$30,569.00", "color": "#6366f1"},
			{"label": "Sales", "value": 55, "amount": "$20,486.00", "color": "#6366f1"},
			{"label": "Operations", "value": 42, "amount": "$12,350.00", "color": "#06b6d4"},
		},
	}
}
