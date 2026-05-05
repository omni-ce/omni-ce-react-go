package functions

import "react-go/core/types"

func TestBarFunction(req types.FunctionRequest) any {
	return map[string]any{
		"categories": []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"},
		"series": []map[string]any{
			{
				"name": "Visitors",
				"data": []int{180, 350, 280, 320, 200, 240, 370, 300, 250, 220, 310, 260},
				"color": "#6366f1",
			},
		},
		"stacked": false,
	}
}
