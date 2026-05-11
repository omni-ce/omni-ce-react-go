package event

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"react-go/core/dto"
	"react-go/core/function"
	"react-go/core/sse"
	"react-go/core/variable"
	"strconv"
	"sync"
	"time"

	"react-go/core/modules/dashboard"
	dashboardModel "react-go/core/modules/dashboard/model"
	notification "react-go/core/modules/notification/model"
	role "react-go/core/modules/role/model"
	"react-go/core/types"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func Stream(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "token is required",
		})
	}

	claims, err := function.JwtValidateToken(token)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "invalid token",
		})
	}

	connectedUserID := claims.ID

	client := &sse.Client{
		ID:   connectedUserID,
		Chan: make(chan string, 100),
	}

	sse.AppHub.Mutex.Lock()
	sse.AppHub.Clients[connectedUserID] = client
	sse.AppHub.Mutex.Unlock()

	log.Printf("✅ SSE: User %s connected", connectedUserID)

	// Send recent notifications upon connection
	go func(uid string, ch chan string) {
		notifs := make([]notification.Notification, 0)
		variable.Db.Where("user_id = ? AND deleted_at IS NULL", uid).
			Order("id DESC").Limit(10).Find(&notifs)

		notifMaps := make([]map[string]any, 0)
		for _, n := range notifs {
			notifMaps = append(notifMaps, n.Map())
		}

		payload, _ := json.Marshal(map[string]any{
			"event": "notification",
			"data":  notifMaps,
		})
		ch <- string(payload)
	}(connectedUserID, client.Chan)

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
		defer func() {
			sse.AppHub.Mutex.Lock()
			delete(sse.AppHub.Clients, connectedUserID)
			sse.AppHub.Mutex.Unlock()
			log.Printf("🛸 SSE: User %s disconnected", connectedUserID)
		}()

		for {
			select {
			case msg, ok := <-client.Chan:
				if !ok {
					return
				}
				fmt.Fprintf(w, "data: %s\n\n", msg)
				if err := w.Flush(); err != nil {
					return
				}

			case <-time.After(30 * time.Second):
				fmt.Fprintf(w, ": ping\n\n")
				if err := w.Flush(); err != nil {
					return
				}
			}
		}
	})

	return nil
}

func Dashboard(c *fiber.Ctx) error {
	existing, err := function.JwtGetUser(c)
	if err != nil {
		return dto.Unauthorized(c, types.Language{
			Id: "Tidak terotorisasi",
			En: "Unauthorized",
		}, nil)
	}
	connectedUserID := existing.ID

	roleID := c.Query("role_id")
	if existing.Role != "su" {
		var exist int64
		if err := variable.Db.
			Where("role_id = ? AND user_id = ?", roleID, connectedUserID).
			Select("id").
			Find(&role.RoleUser{}).
			Count(&exist).
			Error; err != nil {
			return dto.InternalServerError(c, types.Language{
				Id: "Gagal mendapatkan role",
				En: "Failed to get roles",
			}, nil)
		}
		if exist == 0 {
			return dto.Unauthorized(c, types.Language{
				Id: "Tidak terotorisasi",
				En: "Unauthorized",
			}, nil)
		}
	}

	roleIDUint, _ := strconv.ParseUint(roleID, 10, 32)
	client := &DashboardClient{
		Chan:   make(chan string, 100),
		RoleID: uint(roleIDUint),
		UserID: connectedUserID.String(),
	}

	// Since a user might have multiple dashboard tabs, use a unique ID for the client
	clientID := uuid.New().String()

	dashboardHub.Mutex.Lock()
	dashboardHub.Clients[clientID] = client
	dashboardHub.Mutex.Unlock()

	log.Printf("✅ SSE: User %s connected to Dashboard", connectedUserID)

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
		defer func() {
			dashboardHub.Mutex.Lock()
			delete(dashboardHub.Clients, clientID)
			dashboardHub.Mutex.Unlock()
			log.Printf("🛸 SSE: User %s disconnected from Dashboard", connectedUserID)
		}()

		for {
			select {
			case msg, ok := <-client.Chan:
				if !ok {
					return
				}
				fmt.Fprintf(w, "data: %s\n\n", msg)
				if err := w.Flush(); err != nil {
					return
				}

			case <-time.After(30 * time.Second):
				fmt.Fprintf(w, ": ping\n\n")
				if err := w.Flush(); err != nil {
					return
				}
			}
		}
	})

	return nil
}

// Dashboard Hub
type DashboardClient struct {
	Chan   chan string
	RoleID uint
	UserID string
}

var dashboardHub = struct {
	Clients map[string]*DashboardClient
	Mutex   sync.RWMutex
}{
	Clients: make(map[string]*DashboardClient),
}

func init() {
	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			dashboardHub.Mutex.RLock()
			for _, client := range dashboardHub.Clients {
				// Fetch and evaluate widgets
				var widgets []dashboardModel.DashboardWidget
				variable.Db.Where("role_id = ?", client.RoleID).Find(&widgets)

				widgetResults := make([]map[string]any, 0)
				for _, w := range widgets {
					fn, err := findFunction(dashboard.RegisterFunctions, w.Type, w.FunctionKey)
					if err == nil {
						res := fn(types.FunctionRequest{
							RoleID: client.RoleID,
							UserID: client.UserID,
						})
						widgetResults = append(widgetResults, map[string]any{
							"id":   w.ID,
							"data": res,
						})
					}
				}

				widgetsBytes, _ := json.Marshal(map[string]any{
					"event": "live_widgets",
					"data": map[string]any{
						"widgets": widgetResults,
					},
				})
				widgetsMsg := string(widgetsBytes)

				select {
				case client.Chan <- widgetsMsg:
				default:
				}
			}
			dashboardHub.Mutex.RUnlock()
		}
	}()
}

func findFunction(registerFunctions types.Function, _type string, key string) (func(req types.FunctionRequest) any, error) {
	items, ok := registerFunctions[_type]
	if !ok {
		return nil, fmt.Errorf("Invalid function type")
	}

	for _, v := range items {
		if v.Key == key {
			return v.Function, nil
		}
	}

	return nil, fmt.Errorf("Function not found")
}
