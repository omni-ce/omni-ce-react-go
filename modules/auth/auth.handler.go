package auth

import (
	"fmt"
	"time"

	"react-go/dto"
	"react-go/environment"
	"react-go/function"
	"react-go/middlewares"
	model "react-go/modules/user/model"
	"react-go/variable"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateToken(userID string, role string) (string, error) {
	claims := jwt.MapClaims{
		"id":   userID,
		"role": role,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(environment.GetJWTSecret())
}

func ParseToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return environment.GetJWTSecret(), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return dto.BadRequest(c, "Invalid request body", nil)
	}

	if req.Username == "" {
		return dto.BadRequest(c, "Username is required", nil)
	}
	if req.Password == "" {
		return dto.BadRequest(c, "Password is required", nil)
	}

	// Find user by username
	var user model.User
	if err := variable.Db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		return dto.Unauthorized(c, "Invalid username or password", nil)
	}

	// Verify password
	if !function.ValidatePassword(req.Password, user.Password) {
		return dto.Unauthorized(c, "Invalid username or password", nil)
	}

	token, err := GenerateToken(user.ID.String(), user.Role)
	if err != nil {
		return dto.InternalServerError(c, "Failed to generate token", nil)
	}

	return dto.OK(c, "Login success", fiber.Map{
		"token": token,
	})
}

func Logout(c *fiber.Ctx) error {
	// logic revoke
	return dto.OK(c, "Logout success", nil)
}

func Validate(c *fiber.Ctx) error {
	claims := c.Locals(string(middlewares.ClaimsContextKey)).(*function.JwtClaims)
	userID, err := uuid.Parse(claims.ID)
	if err != nil {
		return dto.Unauthorized(c, "Invalid user", nil)
	}

	user := model.User{}
	if err := variable.Db.
		First(&user, "id = ?", userID).
		Error; err != nil {
		return dto.InternalServerError(c, "Failed to fetch user", nil)
	}
	return dto.OK(c, "Token valid", fiber.Map{
		"user": user,
	})
}
