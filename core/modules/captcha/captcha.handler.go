package captcha

import (
	"math/rand"
	"react-go/core/dto"
	"react-go/core/enigma"
	"react-go/core/function"
	"react-go/core/variable"
	"strconv"
	"strings"
	"time"

	model "react-go/core/modules/captcha/model"

	"github.com/gofiber/fiber/v2"
)

func Generate(c *fiber.Ctx) error {
	clearExpiredCaptcha()

	digitCount, ok := getDigitCountOverrideFromQuery(c)
	if !ok {
		return dto.BadRequest(c, "Invalid digit count", nil)
	}

	record, err := createCaptcha(digitCount)
	if err != nil {
		return dto.InternalServerError(c, "Failed to generate captcha", nil)
	}

	return returnGenerate(c, record.Captcha, record.ID.String())
}

func Validate(c *fiber.Ctx) error {
	clearExpiredCaptcha()

	var body struct {
		CaptchaID string `json:"captcha_id"`
		Captcha   string `json:"captcha"`
	}
	if err := c.BodyParser(&body); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	if body.CaptchaID == "" || body.Captcha == "" {
		return dto.BadRequest(c, "captcha_id and captcha are required", nil)
	}

	var record model.Captcha
	if err := variable.Db.Where("id = ?", body.CaptchaID).First(&record).Error; err != nil {
		return dto.BadRequest(c, "Captcha not found or expired", nil)
	}

	// Case-sensitive comparison
	if !strings.EqualFold(strings.TrimSpace(record.Captcha), strings.TrimSpace(body.Captcha)) {
		return dto.BadRequest(c, "Captcha is incorrect", nil)
	}

	// Delete used captcha
	variable.Db.Delete(&record)

	return dto.NoContent(c, "Captcha validated successfully", nil)
}

func Regenerate(c *fiber.Ctx) error {
	clearExpiredCaptcha()

	var body struct {
		LastCaptchaID string `json:"last_captcha_id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	// Delete old captcha if provided
	if body.LastCaptchaID != "" {
		variable.Db.Where("id = ?", body.LastCaptchaID).Delete(&model.Captcha{})
	}

	digitCount, ok := getDigitCountOverrideFromQuery(c)
	if !ok {
		return dto.BadRequest(c, "Invalid digit count", nil)
	}

	record, err := createCaptcha(digitCount)
	if err != nil {
		return dto.InternalServerError(c, "Failed to regenerate captcha", nil)
	}

	return returnGenerate(c, record.Captcha, record.ID.String())
}

// ============================================ //

func returnGenerate(c *fiber.Ctx, captchaCode string, captchaId string) error {
	encrypted, err := function.Encryption{}.Encode(enigma.GeneralEnigmaSchema(c.Get("Origin")), captchaCode)
	if err != nil {
		return dto.InternalServerError(c, "Failed to encrypt captcha", nil)
	}

	// decrypted, err := function.Encryption{}.Decode(enigma.GeneralEnigmaSchema(c.Get("Origin")), encrypted)
	// if err != nil {
	// 	return dto.InternalServerError(c, "Failed to decrypt captcha", nil)
	// }
	// fmt.Printf("Decrypted: %s\n", decrypted)

	return dto.OK(c, "Captcha regenerated successfully", fiber.Map{
		"captcha":    encrypted,
		"captcha_id": captchaId,
	})
}

func generateRandomString(length int) string {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[r.Intn(len(charset))]
	}
	return string(b)
}

func getDigitCountOverrideFromQuery(c *fiber.Ctx) (int, bool) {
	q := strings.TrimSpace(c.Query("length"))
	if q == "" {
		return 0, false
	}
	val, err := strconv.Atoi(q)
	if err != nil || val <= 0 {
		return 0, false
	}
	return val, true
}

func createCaptcha(digitCount int) (*model.Captcha, error) {
	captchaText := generateRandomString(digitCount)

	record := &model.Captcha{
		Captcha: captchaText,
	}
	if err := variable.Db.Create(record).Error; err != nil {
		return nil, err
	}
	return record, nil
}

func clearExpiredCaptcha() {
	// jika created_at lebih dari 5 menit dari sekarang maka di delete
	expired_captcha_minute := 5
	var records []model.Captcha
	variable.Db.Where("created_at < ?", time.Now().Add(-time.Duration(expired_captcha_minute)*time.Minute)).Find(&records)
	for _, record := range records {
		variable.Db.Delete(&record)
	}
}
