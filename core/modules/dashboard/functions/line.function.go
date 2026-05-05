package functions

import "react-go/core/types"

func TestLineFunction(req types.FunctionRequest) any {
	return map[string]any{
		"categories": []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun"},
		"series": []map[string]any{
			{
				"name": "This Year",
				"data": []int{150, 180, 200, 220, 250, 280},
				"color": "#6366f1",
			},
			{
				"name": "Last Year",
				"data": []int{120, 140, 160, 170, 190, 210},
				"color": "#3d3d5c",
				"dashStyle": "Dash",
			},
		},
	}
}
