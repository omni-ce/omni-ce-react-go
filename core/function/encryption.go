package function

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/des"
	"crypto/rand"
	"crypto/rc4"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
)

type Encryption struct{}

type EncryptionMethod string

const (
	AES       EncryptionMethod = "AES"
	TripleDES EncryptionMethod = "TripleDES"
	DES       EncryptionMethod = "DES"
	RC4       EncryptionMethod = "RC4"
	Base64    EncryptionMethod = "base64"
)

type EnigmaSchema struct {
	Method EncryptionMethod
	Key    func() string
}

// Helper function to hash the key using SHA256
func hashKey(key string) []byte {
	hash := sha256.Sum256([]byte(key))
	return hash[:]
}

// Helper function to reverse strings
func ReverseStrings(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

// PKCS7 Padding
func pkcs7Padding(ciphertext []byte, blockSize int) []byte {
	padding := blockSize - len(ciphertext)%blockSize
	padtext := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(ciphertext, padtext...)
}

// PKCS7 Unpadding
func pkcs7Unpadding(origData []byte) ([]byte, error) {
	length := len(origData)
	if length == 0 {
		return nil, errors.New("empty data")
	}
	unpadding := int(origData[length-1])
	if unpadding > length {
		return nil, errors.New("invalid padding")
	}
	return origData[:(length - unpadding)], nil
}

// Generic CBC Encryption
func encryptCBC(block cipher.Block, plaintext string) (string, error) {
	blockSize := block.BlockSize()
	content := pkcs7Padding([]byte(plaintext), blockSize)

	ciphertext := make([]byte, blockSize+len(content))
	iv := ciphertext[:blockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	mode := cipher.NewCBCEncrypter(block, iv)
	mode.CryptBlocks(ciphertext[blockSize:], content)

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Generic CBC Decryption
func decryptCBC(block cipher.Block, ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	blockSize := block.BlockSize()
	if len(data) < blockSize {
		return "", errors.New("ciphertext too short")
	}

	iv := data[:blockSize]
	data = data[blockSize:]

	if len(data)%blockSize != 0 {
		return "", errors.New("ciphertext is not a multiple of the block size")
	}

	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(data, data)

	res, err := pkcs7Unpadding(data)
	if err != nil {
		return "", err
	}
	return string(res), nil
}

// AES Encryption and Decryption
func encryptAES(key []byte, plaintext string) (string, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	return encryptCBC(block, plaintext)
}

func decryptAES(key []byte, ciphertext string) (string, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	return decryptCBC(block, ciphertext)
}

// DES Encryption and Decryption
func encryptDES(key []byte, plaintext string) (string, error) {
	block, err := des.NewCipher(key[:8]) // DES uses 8-byte key
	if err != nil {
		return "", err
	}
	return encryptCBC(block, plaintext)
}

func decryptDES(key []byte, ciphertext string) (string, error) {
	block, err := des.NewCipher(key[:8])
	if err != nil {
		return "", err
	}
	return decryptCBC(block, ciphertext)
}

// TripleDES Encryption and Decryption
func encryptTripleDES(key []byte, plaintext string) (string, error) {
	block, err := des.NewTripleDESCipher(key[:24]) // 3DES uses 24-byte key
	if err != nil {
		return "", err
	}
	return encryptCBC(block, plaintext)
}

func decryptTripleDES(key []byte, ciphertext string) (string, error) {
	block, err := des.NewTripleDESCipher(key[:24])
	if err != nil {
		return "", err
	}
	return decryptCBC(block, ciphertext)
}

// RC4 Encryption and Decryption
func encryptRC4(key []byte, plaintext string) (string, error) {
	cipher, err := rc4.NewCipher(key)
	if err != nil {
		return "", err
	}

	ciphertext := make([]byte, len(plaintext))
	cipher.XORKeyStream(ciphertext, []byte(plaintext))

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func decryptRC4(key []byte, ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	cipher, err := rc4.NewCipher(key)
	if err != nil {
		return "", err
	}

	plaintext := make([]byte, len(data))
	cipher.XORKeyStream(plaintext, data)

	return string(plaintext), nil
}

// Apply encryption or decryption method
func applyMethod(text string, layer EnigmaSchema, isEncrypt bool) (string, error) {
	if layer.Method == Base64 {
		if isEncrypt {
			return base64.StdEncoding.EncodeToString([]byte(text)), nil
		}
		data, err := base64.StdEncoding.DecodeString(text)
		if err != nil {
			return "", err
		}
		return string(data), nil
	} else if layer.Key != nil {
		key := hashKey(layer.Key())
		switch layer.Method {
		case AES:
			if isEncrypt {
				return encryptAES(key, text)
			} else {
				return decryptAES(key, text)
			}
		case DES:
			if isEncrypt {
				return encryptDES(key, text)
			} else {
				return decryptDES(key, text)
			}
		case TripleDES:
			if isEncrypt {
				return encryptTripleDES(key, text)
			} else {
				return decryptTripleDES(key, text)
			}
		case RC4:
			if isEncrypt {
				return encryptRC4(key, text)
			} else {
				return decryptRC4(key, text)
			}
		}
	}
	return "", fmt.Errorf("Key function missing for method: %s", layer.Method)
}

// Encode applies encryption layers to the input text
func (ref Encryption) Encode(enigmaSchema []EnigmaSchema, text string) (string, error) {
	var err error
	cipherText := text
	for _, layer := range enigmaSchema {
		cipherText, err = applyMethod(cipherText, layer, true)
		if err != nil {
			return "", err
		}
	}
	return cipherText, nil
}

// Decode applies decryption layers to the input cipher text
func (ref Encryption) Decode(enigmaSchema []EnigmaSchema, encrypted string) (string, error) {
	var err error
	plainText := encrypted
	for i := len(enigmaSchema) - 1; i >= 0; i-- {
		plainText, err = applyMethod(plainText, enigmaSchema[i], false)
		if err != nil {
			return "", err
		}
	}
	return plainText, nil
}
