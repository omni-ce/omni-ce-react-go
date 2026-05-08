package location

import (
	"fmt"
	"react-go/core/function/fetch"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

var addressIDRegex = regexp.MustCompile(`^\d{2}\.\d{2}\.\d{2}\.\d{4}$`)

type WilayahResponse struct {
	Data []struct {
		Code string `json:"code"`
		Name string `json:"name"`
	} `json:"data"`
}

func fetchWilayah(url string) ([]fiber.Map, error) {
	var result WilayahResponse
	err := fetch.DoJSON(fetch.RequestOptions{
		URL: url,
	}, &result)
	if err != nil {
		return nil, err
	}

	data := make([]fiber.Map, len(result.Data))
	for i, d := range result.Data {
		data[i] = fiber.Map{"value": d.Code, "label": d.Name}
	}

	return data, nil
}

func GetProvinces() ([]fiber.Map, error) {
	return fetchWilayah("https://wilayah.id/api/provinces.json")
}

func GetRegencies(provCode string) ([]fiber.Map, error) {
	return fetchWilayah(fmt.Sprintf("https://wilayah.id/api/regencies/%s.json", provCode))
}

func GetDistricts(regCode string) ([]fiber.Map, error) {
	return fetchWilayah(fmt.Sprintf("https://wilayah.id/api/districts/%s.json", regCode))
}

func GetVillages(distCode string) ([]fiber.Map, error) {
	return fetchWilayah(fmt.Sprintf("https://wilayah.id/api/villages/%s.json", distCode))
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
	provData, err := GetProvinces()
	if err != nil {
		return "", fmt.Errorf("Failed to fetch province"), false
	}
	provName := findName(provData, provCode)

	// 2. Get Regency
	regData, err := GetRegencies(provCode)
	if err != nil {
		return "", fmt.Errorf("Failed to fetch regency"), false
	}
	regName := findName(regData, regCode)

	// 3. Get District
	distData, err := GetDistricts(regCode)
	if err != nil {
		return "", fmt.Errorf("Failed to fetch district"), false
	}
	distName := findName(distData, distCode)

	// 4. Get Village
	villageData, err := GetVillages(distCode)
	if err != nil {
		return "", fmt.Errorf("Failed to fetch village"), false
	}
	villageName := findName(villageData, villageCode)

	fullAddress := strings.Join([]string{villageName, distName, regName, provName}, ", ")
	return fullAddress, nil, false
}
