package functions

import (
	"react-go/core/types"
)

func TestTimelineFunction(req types.FunctionRequest) any {
	return map[string]any{
		"categories": []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"},
		"series": []map[string]any{
			{
				"name": "Revenue",
				"data": []int{180, 200, 175, 190, 160, 170, 150, 165, 185, 195, 210, 230},
				"color": "#6366f1",
			},
			{
				"name": "Expenses",
				"data": []int{40, 55, 35, 50, 30, 45, 25, 35, 55, 50, 60, 65},
				"color": "#06b6d4",
			},
		},
		"summaryStats": []map[string]any{
			{
				"label": "Avg. Yearly Profit",
				"value": "$212,142.12",
				"change": "+23.2%",
				"up": true,
			},
			{
				"label": "Avg. Yearly Loss",
				"value": "$30,321.23",
				"change": "-12.3%",
				"up": false,
			},
		},
	}
}
