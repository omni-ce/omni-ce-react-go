package function

import (
	"crypto/sha256"
	"encoding/hex"
)

func EncryptPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

func ValidatePassword(password string, hashedPassword string) bool {
	return EncryptPassword(password) == hashedPassword
}
