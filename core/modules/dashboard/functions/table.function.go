package functions

import "react-go/core/types"

func TestTableFunction(req types.FunctionRequest) any {
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
