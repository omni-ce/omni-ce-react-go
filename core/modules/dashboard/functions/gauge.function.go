package functions

import "react-go/core/types"

func TestGaugeFunction(req types.FunctionRequest) any {
	return map[string]any{
		"value": 75.55,
		"max": 100,
		"label": "%",
		"color": "#6366f1",
		"bottomStats": []map[string]any{
			{"label": "Target", "value": "$20K", "change": "3.2%", "up": false},
			{"label": "Revenue", "value": "$20K", "change": "7.8%", "up": true},
			{"label": "Today", "value": "$20K", "change": "12%", "up": true},
		},
	}
}
