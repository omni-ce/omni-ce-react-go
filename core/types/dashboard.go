package types

// -------------------------------------------------------- //
// -------------------------------------------------------- //

type Function struct {
	Timeline []FunctionItem `json:"timeline"`
	Bar      []FunctionItem `json:"bar"`
	Gauge    []FunctionItem `json:"gauge"`
	Pie      []FunctionItem `json:"pie"`
	Table    []FunctionItem `json:"table"`
	Progress []FunctionItem `json:"progress"`
	Traffic  []FunctionItem `json:"traffic"`
	Line     []FunctionItem `json:"line"`
}
type FunctionRequest struct {
	RoleID uint   `json:"role_id"`
	UserID string `json:"user_id"`
}
type FunctionResponse struct {
	Body any `json:"body"`
}
type FunctionItem struct {
	Label    string                        `json:"label"`
	Key      string                        `json:"key"`
	Function func(req FunctionRequest) any `json:"-"`
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
