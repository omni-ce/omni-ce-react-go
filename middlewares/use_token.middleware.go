package middlewares

import (
	"strings"

	"react-go/dto"
	"react-go/function"

	"github.com/gofiber/fiber/v2"
)

type claimsContextKey string

const ClaimsContextKey claimsContextKey = "claims"

func validateBearerToken(authHeader string) (*function.JwtClaims, string) {
	if authHeader == "" {
		return nil, "Missing authorization header"
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return nil, "Invalid authorization format"
	}
	token := parts[1]

	claims, err := function.JwtValidateToken(token)
	if err != nil {
		return nil, "Invalid or expired token"
	}

	return claims, ""
}

func UseToken(c *fiber.Ctx) error {
	claims, errMsg := validateBearerToken(c.Get("Authorization"))
	if errMsg != "" {
		return dto.Unauthorized(c, errMsg, nil)
	}
	c.Locals(string(ClaimsContextKey), claims)
	return c.Next()
}

func UseQueryToken(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return dto.Unauthorized(c, "Missing token", nil)
	}
	claims, errMsg := validateBearerToken("Bearer " + token)
	if errMsg != "" {
		return dto.Unauthorized(c, errMsg, nil)
	}
	c.Locals(string(ClaimsContextKey), claims)
	return c.Next()
}
