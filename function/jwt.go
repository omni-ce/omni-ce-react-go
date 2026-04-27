package function

import (
	"errors"
	"fmt"
	"react-go/environment"
	"react-go/modules/user/model"
	"react-go/variable"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type JwtClaims struct {
	ID   string `json:"id"`
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func JwtGenerateToken(claims JwtClaims) (string, error) {
	now := time.Now()
	if claims.IssuedAt == nil {
		claims.IssuedAt = jwt.NewNumericDate(now)
	}
	if claims.ExpiresAt == nil {
		claims.ExpiresAt = jwt.NewNumericDate(now.Add(time.Hour * 24 * 30)) // days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(environment.GetJWTSecret())
}

func JwtValidateToken(tokenString string) (*JwtClaims, error) {
	claims := &JwtClaims{}
	parser := jwt.NewParser(jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

	tok, err := parser.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		return environment.GetJWTSecret(), nil
	})
	if err != nil {
		return nil, err
	}
	if tok == nil || !tok.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func JwtGetUser(c *fiber.Ctx) (model.User, error) {
	user := model.User{}

	claims, ok := c.Locals("claims").(*JwtClaims)
	if !ok {
		return user, errors.New("claims not found")
	}
	current_user_id := claims.ID

	if err := variable.Db.
		First(&user, "id = ?", current_user_id).
		Error; err != nil {
		return user, fmt.Errorf("user not found: %v", err)
	}

	return user, nil
}
