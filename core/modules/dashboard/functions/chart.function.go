package functions

import (
	"react-go/core/types"
)

func TestChartAreaFunction(req types.FunctionRequest) any {
	return map[string]any{
		"categories": []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"},
		"series": []map[string]any{
			{
				"name":  "Revenue",
				"data":  []int{180, 200, 175, 190, 160, 170, 150, 165, 185, 195, 210, 230},
				"color": "#6366f1",
			},
			{
				"name":  "Expenses",
				"data":  []int{40, 55, 35, 50, 30, 45, 25, 35, 55, 50, 60, 65},
				"color": "#06b6d4",
			},
		},
		"summaryStats": []map[string]any{
			{
				"label":  "Avg. Yearly Profit",
				"value":  "$212,142.12",
				"change": "+23.2%",
				"up":     true,
			},
			{
				"label":  "Avg. Yearly Loss",
				"value":  "$30,321.23",
				"change": "-12.3%",
				"up":     false,
			},
		},
	}
}

func TestChartBarFunction(req types.FunctionRequest) any {
	return map[string]any{
		"categories": []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"},
		"series": []map[string]any{
			{
				"name":  "Visitors",
				"data":  []int{180, 350, 280, 320, 200, 240, 370, 300, 250, 220, 310, 260},
				"color": "#6366f1",
			},
		},
		"stacked": false,
	}
}

func TestChartGaugeFunction(req types.FunctionRequest) any {
	return map[string]any{
		"value": 75.55,
		"max":   100,
		"label": "%",
		"color": "#6366f1",
		"bottomStats": []map[string]any{
			{"label": "Target", "value": "$20K", "change": "3.2%", "up": false},
			{"label": "Revenue", "value": "$20K", "change": "7.8%", "up": true},
			{"label": "Today", "value": "$20K", "change": "12%", "up": true},
		},
	}
}

func TestChartPieFunction(req types.FunctionRequest) any {
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

func TestChartTableFunction(req types.FunctionRequest) any {
	return map[string]any{
		"columns": map[string]string{"label": "Source", "key": "source"},
		"rows": []map[string]any{
			{"source": "Google", "value": "4.7K"},
			{"source": "Facebook", "value": "3.4K"},
			{"source": "Instagram", "value": "2.9K"},
			{"source": "Twitter", "value": "1.5K"},
		},
		"footerLabel": "Channels Report",
	}
}

func TestChartProgressFunction(req types.FunctionRequest) any {
	return map[string]any{
		"items": []map[string]any{
			{"label": "Marketing", "value": 85, "amount": "$30,569.00", "color": "#6366f1"},
			{"label": "Sales", "value": 55, "amount": "$20,486.00", "color": "#6366f1"},
			{"label": "Operations", "value": 42, "amount": "$12,350.00", "color": "#06b6d4"},
		},
	}
}

func TestChartTrafficFunction(req types.FunctionRequest) any {
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

func TestChartLineFunction(req types.FunctionRequest) any {
	return map[string]any{
		"categories": []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun"},
		"series": []map[string]any{
			{
				"name":  "This Year",
				"data":  []int{150, 180, 200, 220, 250, 280},
				"color": "#6366f1",
			},
			{
				"name":      "Last Year",
				"data":      []int{120, 140, 160, 170, 190, 210},
				"color":     "#3d3d5c",
				"dashStyle": "Dash",
			},
		},
	}
}
