package functions

import "react-go/core/types"

func TestPieFunction(req types.FunctionRequest) any {
	return map[string]any{
		"data": []map[string]any{
			{"name": "Affiliate Program", "y": 2040, "detail": "2,040 Products", "color": "#6366f1"},
			{"name": "Direct Buy", "y": 1402, "detail": "1,402 Products", "color": "#10b981"},
			{"name": "Adsense", "y": 510, "detail": "510 Products", "color": "#f59e0b"},
		},
		"centerLabel": "Total 3.5K",
		"centerValue": "2450",
	}
}
