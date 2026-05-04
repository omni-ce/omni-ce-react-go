package event

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"react-go/dto"
	"react-go/function"
	"react-go/sse"
	"react-go/variable"
	"time"

	notification "react-go/modules/notification/model"

	"github.com/gofiber/fiber/v2"
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

func HelloWorld(c *fiber.Ctx) error {
	return dto.OK(c, "Hello World!", nil)
}
