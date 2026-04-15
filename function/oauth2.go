package function

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"react-go/function/fetch"
	"regexp"
	"strings"
)

type Oauth2GoogleUserInfo struct {
	Sub           string `json:"sub"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
}

func Oauth2FetchGoogleUserInfo(accessToken string) (*Oauth2GoogleUserInfo, error) {
	var info Oauth2GoogleUserInfo
	err := fetch.DoJSON(fetch.RequestOptions{
		Method: http.MethodGet,
		URL:    "https://www.googleapis.com/oauth2/v3/userinfo",
		QueryParams: map[string]string{
			"access_token": accessToken,
		},
	}, &info)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch google user info: %w", err)
	}

	return &info, nil
}

var avatarNameSanitizer = regexp.MustCompile(`[^a-zA-Z0-9_-]+`)

func Oauth2SaveGoogleAvatarToLocal(email, avatarURL string) (string, error) {
	if avatarURL == "" {
		return "", fmt.Errorf("avatar url is empty")
	}

	if err := os.MkdirAll("./file/avatar", 0755); err != nil {
		return "", fmt.Errorf("failed to create avatar directory: %w", err)
	}

	localPart := strings.Split(email, "@")[0]
	safeName := strings.Trim(avatarNameSanitizer.ReplaceAllString(strings.ToLower(localPart), "-"), "-_")

	filename := safeName + ".jpeg"
	filePath := filepath.Join("file", "avatar", filename)

	if _, err := os.Stat(filePath); err == nil {
		return filename, nil
	} else if !os.IsNotExist(err) {
		return "", fmt.Errorf("failed to check avatar file: %w", err)
	}

	resp, err := fetch.Do(fetch.RequestOptions{
		Method: http.MethodGet,
		URL:    avatarURL,
	})
	if err != nil {
		return "", fmt.Errorf("failed to download avatar: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("avatar download returned %d", resp.StatusCode)
	}

	file, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create avatar file: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, resp.Body); err != nil {
		return "", fmt.Errorf("failed to save avatar file: %w", err)
	}

	return filename, nil
}
