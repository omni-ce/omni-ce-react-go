package socket

import (
	"log"
	"react-go/dummy"
	"react-go/function"
	"time"

	"github.com/doquangtan/socketio/v4"
)

var UserNotification map[string]*socketio.Socket = make(map[string]*socketio.Socket)

func Init(io *socketio.Io) {
	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			// live stats
			stats := fetchLiveStats()
			io.To("live_data").Emit("live_data", stats)
		}
	}()

	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			liveNotification()
		}
	}()

	io.OnAuthentication(func(params map[string]string) bool {
		// fmt.Printf("params: %+v\n", params)
		token := params["token"]
		if token == "" {
			return false
		}
		// fmt.Printf("Token: %s\n", token)
		_, err := function.JwtValidateToken(token)
		if err != nil {
			return false
		}
		// fmt.Printf("Claims: %v\n", claims)
		return true
	})

	io.OnConnection(func(socket *socketio.Socket) {
		var connectedUserID string

		log.Println("[socket] client connected:", socket.Id)
		socket.On("disconnect", func(event *socketio.EventPayload) {
			log.Println("[socket] client disconnected:", socket.Id)
			if connectedUserID != "" {
				delete(UserNotification, connectedUserID)
				log.Printf("🛸 Websocket: User %s disconnected", connectedUserID)
			}
		})

		socket.On("join", func(event *socketio.EventPayload) {
			if len(event.Data) == 0 {
				return
			}
			token, ok := event.Data[0].(string)
			if !ok {
				return
			}
			claims, err := function.JwtValidateToken(token)
			if err != nil {
				return
			}
			connectedUserID = claims.ID
			UserNotification[connectedUserID] = socket
			log.Printf("✅ Websocket: User %s connected to socket %s", connectedUserID, socket.Id)
			socket.Emit("notification", dummy.Notifications)
		})

		// ================================================================ //
		// Live Data
		// ================================================================ //

		// Client joins live_data room to receive real-time dashboard stats
		socket.On("join_live_data", func(event *socketio.EventPayload) {
			socket.Join("live_data")
			log.Println("[socket] client joined room: live_data")
			// Push current stats immediately on join
			stats := fetchLiveStats()
			socket.Emit("live_data", stats)
		})

		// Client leaves live_data room
		socket.On("leave_live_data", func(event *socketio.EventPayload) {
			socket.Leave("live_data")
			log.Println("[socket] client left room: live_data")
		})

		// ================================================================ //
		// Log
		// ================================================================ //

		// Client joins update_log room to receive new log entries
		socket.On("join_update_log", func(event *socketio.EventPayload) {
			socket.Join("update_log")
			log.Println("[socket] client joined room: update_log")
		})

		// Client leaves update_log room
		socket.On("leave_update_log", func(event *socketio.EventPayload) {
			socket.Leave("update_log")
			log.Println("[socket] client left room: update_log")
		})
	})
}

// ================================================================ //
// Notification
// ================================================================ //

func liveNotification() {
	// TODO: implement live notification
}

// ================================================================ //
// Live Data
// ================================================================ //

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
	// variable.Db.Table("queues").Count(&s.TotalQueues)
	// variable.Db.Table("queue_messages").Count(&s.TotalMessages)
	// variable.Db.Table("queue_messages").Where("status = ?", "completed").Count(&s.TotalCompleted)
	// variable.Db.Table("queue_messages").Where("status = ? AND is_ack = false", "failed").Count(&s.TotalFailed)
	// variable.Db.Table("queue_messages").Where("status = ?", "timing").Count(&s.TotalTiming)
	// variable.Db.Table("queue_messages").Where("status = ?", "pending").Count(&s.TotalPending)
	// Get per-queue insert counts since last fetch (and reset)
	// s.Queue = queue.GetAndResetQueueInsertCounts()
	return s
}
