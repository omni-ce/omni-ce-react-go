package types

type Notification struct {
	ID        string   `json:"id"`
	Type      string   `json:"type"`
	Title     Language `json:"title"`
	Message   Language `json:"message"`
	Timestamp string   `json:"timestamp"`
	IsRead    bool     `json:"is_read"`
}
