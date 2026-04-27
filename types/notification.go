package types

const (
	NotificationTypeInfo    string = "info"
	NotificationTypeSuccess string = "success"
	NotificationTypeWarning string = "warning"
	NotificationTypeError   string = "error"
	NotificationTypeSystem  string = "system"
)

type Notification struct {
	ID        string   `json:"id"`
	Type      string   `json:"type"`
	Title     Language `json:"title"`
	Message   Language `json:"message"`
	Timestamp string   `json:"timestamp"`
	IsRead    bool     `json:"is_read"`
	Link      *string  `json:"link,omitempty"`
}
