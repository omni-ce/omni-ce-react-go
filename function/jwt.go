package function

import (
	"errors"
	"react-go/environment"
	"time"

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
