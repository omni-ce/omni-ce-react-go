package environment

import (
	"os"
)

func GetEmailEnv() (string, string) {
	url := os.Getenv("EMAIL_URL")
	apiKey := os.Getenv("EMAIL_API_KEY")

	return url, apiKey
}
