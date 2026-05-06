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
			Function: funcs.TestTimelineFunction,
		},
	},
	"chart_column": []types.FunctionItem{
		{
			Label:    "Statistik Bar",
			Key:      "chart_column_dummy",
			Function: funcs.TestBarFunction,
		},
	},
	"chart_gauge": []types.FunctionItem{
		{
			Label:    "Target Gauge",
			Key:      "chart_gauge_dummy",
			Function: funcs.TestGaugeFunction,
		},
	},
	"chart_pie": []types.FunctionItem{
		{
			Label:    "Donut / Pie Chart",
			Key:      "chart_pie_dummy",
			Function: funcs.TestPieFunction,
		},
	},
	"chart_table": []types.FunctionItem{
		{
			Label:    "List Table",
			Key:      "chart_table_dummy",
			Function: funcs.TestTableFunction,
		},
	},
	"chart_progress": []types.FunctionItem{
		{
			Label:    "Progress List",
			Key:      "chart_progress_dummy",
			Function: funcs.TestProgressFunction,
		},
	},
	"chart_traffic": []types.FunctionItem{
		{
			Label:    "Traffic Data",
			Key:      "chart_traffic_dummy",
			Function: funcs.TestTrafficFunction,
		},
	},
	"chart_line": []types.FunctionItem{
		{
			Label:    "Line Chart",
			Key:      "chart_line_dummy",
			Function: funcs.TestLineFunction,
		},
	},
}
