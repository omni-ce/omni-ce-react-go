package address

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"react-go/core/dto"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

var addressIDRegex = regexp.MustCompile(`^\d{2}\.\d{2}\.\d{2}\.\d{4}$`)

func fetchAddress(url string) ([]fiber.Map, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	var result struct {
		Data []struct {
			Code string `json:"code"`
			Name string `json:"name"`
		} `json:"data"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}

	data := make([]fiber.Map, len(result.Data))
	for i, d := range result.Data {
		data[i] = fiber.Map{"value": d.Code, "label": d.Name}
	}

	return data, nil
}

func findName(data []fiber.Map, value string) string {
	for _, item := range data {
		if item["value"] == value {
			if label, ok := item["label"].(string); ok {
				return label
			}
		}
	}
	return ""
}

func Provinces(c *fiber.Ctx) error {
	data, err := fetchAddress("https://wilayah.id/api/provinces.json")
	if err != nil {
		return dto.InternalServerError(c, "Internal Server Error", nil)
	}
	return dto.OK(c, "Province fetched successfully!", data)
}

func Regencies(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := fetchAddress(fmt.Sprintf("https://wilayah.id/api/regencies/%s.json", id))
	if err != nil {
		return dto.InternalServerError(c, "Internal Server Error", nil)
	}
	return dto.OK(c, "Regencies fetched successfully!", data)
}

func Districts(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := fetchAddress(fmt.Sprintf("https://wilayah.id/api/districts/%s.json", id))
	if err != nil {
		return dto.InternalServerError(c, "Internal Server Error", nil)
	}
	return dto.OK(c, "Districts fetched successfully!", data)
}

func Villages(c *fiber.Ctx) error {
	id := c.Params("id")
	data, err := fetchAddress(fmt.Sprintf("https://wilayah.id/api/villages/%s.json", id))
	if err != nil {
		return dto.InternalServerError(c, "Internal Server Error", nil)
	}
	return dto.OK(c, "Villages fetched successfully!", data)
}

func Get(c *fiber.Ctx) error {
	id := c.Params("id") // 34.02.12.2007

	fullAddress, err, isBadRequest := GetFull(id)
	if err != nil {
		if isBadRequest {
			return dto.BadRequest(c, err.Error(), nil)
		}
		return dto.InternalServerError(c, err.Error(), nil)
	}

	return dto.OK(c, "Address retrieved successfully!", fullAddress)
}

func GetFull(id string) (string, error, bool) {
	if !addressIDRegex.MatchString(id) {
		return "", fmt.Errorf("Invalid address ID format. Expected XX.XX.XX.XXXX"), true
	}

	parts := strings.Split(id, ".")
	provCode := parts[0]
	regCode := provCode + "." + parts[1]
	distCode := regCode + "." + parts[2]
	villageCode := id

	// 1. Get Province
	provData, err := fetchAddress("https://wilayah.id/api/provinces.json")
	if err != nil {
		return "", fmt.Errorf("Failed to fetch province"), false
	}
	provName := findName(provData, provCode)

	// 2. Get Regency
	regData, err := fetchAddress(fmt.Sprintf("https://wilayah.id/api/regencies/%s.json", provCode))
	if err != nil {
		return "", fmt.Errorf("Failed to fetch regency"), false
	}
	regName := findName(regData, regCode)

	// 3. Get District
	distData, err := fetchAddress(fmt.Sprintf("https://wilayah.id/api/districts/%s.json", regCode))
	if err != nil {
		return "", fmt.Errorf("Failed to fetch district"), false
	}
	distName := findName(distData, distCode)

	// 4. Get Village
	villageData, err := fetchAddress(fmt.Sprintf("https://wilayah.id/api/villages/%s.json", distCode))
	if err != nil {
		return "", fmt.Errorf("Failed to fetch village"), false
	}
	villageName := findName(villageData, villageCode)

	fullAddress := strings.Join([]string{villageName, distName, regName, provName}, ", ")
	return fullAddress, nil, false
}
