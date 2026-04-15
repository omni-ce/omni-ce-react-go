package function

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"react-go/environment"
)

type SendEmailResponseData struct {
	Key string `json:"key"`
}

type SendEmailResponse struct {
	Status  int                   `json:"status"`
	Message string                `json:"message"`
	Data    SendEmailResponseData `json:"data"`
}

func SendEmail(to string, subject string, body string) error {
	url, apiKey := environment.GetEmailEnv()

	payload, err := json.Marshal(map[string]string{
		"to":      to,
		"subject": subject,
		"body":    body,
	})
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest("POST", url+"/api/message/send", bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	var result SendEmailResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}
	fmt.Printf("SendEmail response: %+v\n", result)

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("email API returned status: %d", resp.StatusCode)
	}

	return nil
}
