package functions

import "react-go/core/types"

func TestTrafficFunction(req types.FunctionRequest) any {
	return map[string]any{
		"stats": []map[string]any{
			{
				"label": "New Subscribers", "value": "567K", "change": "3.85%", "up": true,
				"sparkData": []int{20, 35, 25, 45, 30, 40, 55, 50, 60}, "color": "#10b981",
			},
			{
				"label": "Conversion Rate", "value": "276K", "change": "-5.39%", "up": false,
				"sparkData": []int{50, 40, 45, 35, 40, 30, 25, 28, 22}, "color": "#ef4444",
			},
			{
				"label": "Page Bounce Rate", "value": "285", "change": "12.74%", "up": true,
				"sparkData": []int{10, 15, 20, 18, 25, 30, 35, 40, 50}, "color": "#10b981",
			},
		},
	}
}
