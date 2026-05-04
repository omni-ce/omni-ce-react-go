package sse

import (
	"encoding/json"
	"log"
	notification "react-go/modules/notification/model"
	"react-go/types"
	"react-go/variable"
	"sync"
	"time"

	"github.com/google/uuid"
)

type Client struct {
	ID   string
	Chan chan string
}

type Hub struct {
	Clients map[string]*Client
	Mutex   sync.RWMutex
}

var AppHub = Hub{
	Clients: make(map[string]*Client),
}

func Init() {
	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			// live stats
			stats := fetchLiveStats()
			BroadcastEvent("live_data", stats)
		}
	}()

	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			liveNotification()
		}
	}()
}

func BroadcastEvent(event string, data any) {
	payloadBytes, err := json.Marshal(map[string]any{
		"event": event,
		"data":  data,
	})
	if err != nil {
		return
	}
	msg := string(payloadBytes)

	AppHub.Mutex.RLock()
	defer AppHub.Mutex.RUnlock()

	for _, client := range AppHub.Clients {
		select {
		case client.Chan <- msg:
		default:
			// Client channel full or nobody reading
		}
	}
}

func SendEventToUser(userID string, event string, data any) {
	payloadBytes, err := json.Marshal(map[string]any{
		"event": event,
		"data":  data,
	})
	if err != nil {
		return
	}
	msg := string(payloadBytes)

	AppHub.Mutex.RLock()
	client, ok := AppHub.Clients[userID]
	AppHub.Mutex.RUnlock()

	if ok {
		select {
		case client.Chan <- msg:
		default:
		}
	}
}

func SendNotification(userId uuid.UUID, notif types.Notification) {
	titleBytes, _ := json.Marshal(notif.Title)
	messageBytes, _ := json.Marshal(notif.Message)

	inserted := notification.Notification{
		UserID:  userId,
		Type:    notif.Type,
		Title:   string(titleBytes),
		Message: string(messageBytes),
	}
	if err := variable.Db.Create(&inserted).Error; err != nil {
		log.Printf("❌ Failed to insert notification for user %s: %v", userId, err)
		return
	}

	SendEventToUser(userId.String(), "notification", inserted.Map())
}

func liveNotification() {
	// TODO: implement live notification
}

type liveStats struct {
	TotalQueues    int64          `json:"total_queues"`
	TotalMessages  int64          `json:"total_messages"`
	TotalCompleted int64          `json:"total_completed"`
	TotalFailed    int64          `json:"total_failed"`
	TotalTiming    int64          `json:"total_timing"`
	TotalPending   int64          `json:"total_pending"`
	Queue          map[string]int `json:"queue"`
}

func fetchLiveStats() liveStats {
	var s liveStats
	return s
}
