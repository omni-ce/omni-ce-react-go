package dashboard

import (
	funcs "react-go/core/modules/dashboard/functions"
	"react-go/core/types"
)

var RegisterFunctions = types.Function{
	"chart_area": []types.FunctionItem{
		{
			Label:    "Statistik Area",
			Key:      "chart_area_dummy",
			Function: funcs.TestChartAreaFunction,
		},
	},
	"chart_column": []types.FunctionItem{
		{
			Label:    "Statistik Bar",
			Key:      "chart_column_dummy",
			Function: funcs.TestChartBarFunction,
		},
	},
	"chart_gauge": []types.FunctionItem{
		{
			Label:    "Target Gauge",
			Key:      "chart_gauge_dummy",
			Function: funcs.TestChartGaugeFunction,
		},
	},
	"chart_pie": []types.FunctionItem{
		{
			Label:    "Donut / Pie Chart",
			Key:      "chart_pie_dummy",
			Function: funcs.TestChartPieFunction,
		},
	},
	"chart_table": []types.FunctionItem{
		{
			Label:    "List Table",
			Key:      "chart_table_dummy",
			Function: funcs.TestChartTableFunction,
		},
	},
	"chart_progress": []types.FunctionItem{
		{
			Label:    "Progress List",
			Key:      "chart_progress_dummy",
			Function: funcs.TestChartProgressFunction,
		},
	},
	"chart_traffic": []types.FunctionItem{
		{
			Label:    "Traffic Data",
			Key:      "chart_traffic_dummy",
			Function: funcs.TestChartTrafficFunction,
		},
	},
	"chart_line": []types.FunctionItem{
		{
			Label:    "Line Chart",
			Key:      "chart_line_dummy",
			Function: funcs.TestChartLineFunction,
		},
	},
}
