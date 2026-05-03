package dashboard

// -------------------------------------------------------- //
// -------------------------------------------------------- //

type Function struct {
	Timeline []func(req FunctionRequest) FunctionItem `json:"timeline"`
	Bar      []func(req FunctionRequest) FunctionItem `json:"bar"`
	Gauge    []func(req FunctionRequest) FunctionItem `json:"gauge"`
	Pie      []func(req FunctionRequest) FunctionItem `json:"pie"`
	Table    []func(req FunctionRequest) FunctionItem `json:"table"`
	Progress []func(req FunctionRequest) FunctionItem `json:"progress"`
	Traffic  []func(req FunctionRequest) FunctionItem `json:"traffic"`
	Line     []func(req FunctionRequest) FunctionItem `json:"line"`
}
type FunctionRequest struct {
	RoleID uint `json:"role_id"`
}
type FunctionItem struct {
	Body any `json:"body"`
}

// -------------------------------------------------------- //
// -------------------------------------------------------- //

type FunctionTimeline struct {
	XType string                `json:"x_type"`
	Rows  []FunctionTimelineRow `json:"rows"`
}
type FunctionTimelineRow struct {
	X any   `json:"x"`
	Y int64 `json:"y"`
}
