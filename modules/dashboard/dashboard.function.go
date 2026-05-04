package dashboard

var functions = Function{
	Timeline: []FunctionItem{
		{
			Label:    "Stok Barang",
			Key:      "stock_barang",
			Function: TestFunctionTimeline,
		},
	},
}

/*
{
	"functions": {
		"timeline": [
			{
				"label": "Stok Barang",
				"key": "stock_barang",
				"function": ""
			}
		]
	}
}
*/

// -------------------------------------------------------- //
// -------------------------------------------------------- //

func TestFunctionTimeline(req FunctionRequest) any {
	return map[string]any{
		"body": "test",
	}
}

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
