package dashboard

var functions = Function{
	Timeline: []func(req FunctionRequest) FunctionItem{
		TestFunctionTimeline,
	},
}

// -------------------------------------------------------- //
// -------------------------------------------------------- //

func TestFunctionTimeline(req FunctionRequest) FunctionItem {
	return FunctionItem{
		Body: "test",
	}
}
