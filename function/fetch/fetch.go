package fetch

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"net/url"
	"strings"
)

type MultipartFile struct {
	FieldName   string
	FileName    string
	Reader      io.Reader
	ContentType string
}

type RequestOptions struct {
	Method          string
	URL             string
	QueryParams     map[string]string
	Headers         map[string]string
	Body            any
	RawBody         io.Reader
	MultipartFields map[string]string
	MultipartFiles  []MultipartFile
	ExpectedStatus  []int
}

var client = &http.Client{
	Transport: &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	},
}

func Do(options RequestOptions) (*http.Response, error) {
	if strings.TrimSpace(options.URL) == "" {
		return nil, fmt.Errorf("request url is required")
	}

	method := strings.TrimSpace(options.Method)
	if method == "" {
		method = http.MethodGet
	}

	requestURL, err := buildURL(options.URL, options.QueryParams)
	if err != nil {
		return nil, err
	}

	body, detectedContentType, err := buildRequestBody(options)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(strings.ToUpper(method), requestURL, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range options.Headers {
		req.Header.Set(key, value)
	}

	if detectedContentType != "" && req.Header.Get("Content-Type") == "" {
		req.Header.Set("Content-Type", detectedContentType)
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to perform request: %w", err)
	}

	if !isExpectedStatus(resp.StatusCode, options.ExpectedStatus) {
		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return resp, nil
}

func DoJSON(options RequestOptions, target any) error {
	resp, err := Do(options)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if target == nil {
		return nil
	}

	if err := json.NewDecoder(resp.Body).Decode(target); err != nil {
		return fmt.Errorf("failed to decode response json: %w", err)
	}

	return nil
}

func buildURL(rawURL string, queryParams map[string]string) (string, error) {
	if len(queryParams) == 0 {
		return rawURL, nil
	}

	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return "", fmt.Errorf("invalid url: %w", err)
	}

	query := parsedURL.Query()
	for key, value := range queryParams {
		query.Set(key, value)
	}

	parsedURL.RawQuery = query.Encode()
	return parsedURL.String(), nil
}

func buildRequestBody(options RequestOptions) (io.Reader, string, error) {
	if len(options.MultipartFields) > 0 || len(options.MultipartFiles) > 0 {
		var bodyBuffer bytes.Buffer
		writer := multipart.NewWriter(&bodyBuffer)

		for key, value := range options.MultipartFields {
			if err := writer.WriteField(key, value); err != nil {
				return nil, "", fmt.Errorf("failed to write multipart field %s: %w", key, err)
			}
		}

		for _, file := range options.MultipartFiles {
			if strings.TrimSpace(file.FieldName) == "" {
				return nil, "", fmt.Errorf("multipart file field name is required")
			}

			fileName := strings.TrimSpace(file.FileName)
			if fileName == "" {
				fileName = "upload.bin"
			}

			header := textproto.MIMEHeader{}
			header.Set("Content-Disposition", fmt.Sprintf(`form-data; name="%s"; filename="%s"`, file.FieldName, fileName))
			if strings.TrimSpace(file.ContentType) != "" {
				header.Set("Content-Type", file.ContentType)
			} else {
				header.Set("Content-Type", "application/octet-stream")
			}

			part, err := writer.CreatePart(header)
			if err != nil {
				return nil, "", fmt.Errorf("failed to create multipart file part: %w", err)
			}

			if _, err := io.Copy(part, file.Reader); err != nil {
				return nil, "", fmt.Errorf("failed to copy multipart file content: %w", err)
			}
		}

		if err := writer.Close(); err != nil {
			return nil, "", fmt.Errorf("failed to finalize multipart body: %w", err)
		}

		return &bodyBuffer, writer.FormDataContentType(), nil
	}

	if options.RawBody != nil {
		return options.RawBody, "", nil
	}

	if options.Body != nil {
		bodyBytes, err := json.Marshal(options.Body)
		if err != nil {
			return nil, "", fmt.Errorf("failed to encode body json: %w", err)
		}

		return bytes.NewReader(bodyBytes), "application/json", nil
	}

	return nil, "", nil
}

func isExpectedStatus(statusCode int, expectedStatus []int) bool {
	if len(expectedStatus) > 0 {
		for _, expected := range expectedStatus {
			if statusCode == expected {
				return true
			}
		}

		return false
	}

	return statusCode >= 200 && statusCode < 300
}
