package dashboard

import (
	"fmt"

	funcs "react-go/core/modules/dashboard/functions"
	"react-go/core/types"
)

var registerFunctions = types.Function{
	Timeline: []types.FunctionItem{
		{
			Label:    "Statistik Area",
			Key:      "timeline_dummy",
			Function: funcs.TestTimelineFunction,
		},
	},
	Bar: []types.FunctionItem{
		{
			Label:    "Statistik Bar",
			Key:      "bar_dummy",
			Function: funcs.TestBarFunction,
		},
	},
	Gauge: []types.FunctionItem{
		{
			Label:    "Target Gauge",
			Key:      "gauge_dummy",
			Function: funcs.TestGaugeFunction,
		},
	},
	Pie: []types.FunctionItem{
		{
			Label:    "Donut / Pie Chart",
			Key:      "pie_dummy",
			Function: funcs.TestPieFunction,
		},
	},
	Table: []types.FunctionItem{
		{
			Label:    "List Table",
			Key:      "table_dummy",
			Function: funcs.TestTableFunction,
		},
	},
	Progress: []types.FunctionItem{
		{
			Label:    "Progress List",
			Key:      "progress_dummy",
			Function: funcs.TestProgressFunction,
		},
	},
	Traffic: []types.FunctionItem{
		{
			Label:    "Traffic Data",
			Key:      "traffic_dummy",
			Function: funcs.TestTrafficFunction,
		},
	},
	Line: []types.FunctionItem{
		{
			Label:    "Line Chart",
			Key:      "line_dummy",
			Function: funcs.TestLineFunction,
		},
	},
}

func FindFunction(_type string, key string) (func(req types.FunctionRequest) any, error) {
	var function func(req types.FunctionRequest) any
	switch _type {
	case "timeline":
		for _, v := range registerFunctions.Timeline {
			if v.Key == key {
				function = v.Function
				break
			}
		}
	case "bar":
		for _, v := range registerFunctions.Bar {
			if v.Key == key {
				function = v.Function
				break
			}
		}
	case "gauge":
		for _, v := range registerFunctions.Gauge {
			if v.Key == key {
				function = v.Function
				break
			}
		}
	case "pie":
		for _, v := range registerFunctions.Pie {
			if v.Key == key {
				function = v.Function
				break
			}
		}
	case "table":
		for _, v := range registerFunctions.Table {
			if v.Key == key {
				function = v.Function
				break
			}
		}
	case "progress":
		for _, v := range registerFunctions.Progress {
			if v.Key == key {
				function = v.Function
				break
			}
		}
	case "traffic":
		for _, v := range registerFunctions.Traffic {
			if v.Key == key {
				function = v.Function
				break
			}
		}
	case "line":
		for _, v := range registerFunctions.Line {
			if v.Key == key {
				function = v.Function
				break
			}
		}
	default:
		return nil, fmt.Errorf("Invalid function type")
	}

	if function == nil {
		return nil, fmt.Errorf("Function not found")
	}

	return function, nil
}

// -------------------------------------------------------- //
// -------------------------------------------------------- //

/*
// SSE Side
{
  "widgets": [
		{
			"id": "019df3a7-eb44-7733-8233-37424a217ff9",
			"data": {}
		}
  ]
}
*/
