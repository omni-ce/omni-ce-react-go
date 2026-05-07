package enigma

import "react-go/core/function"

func GeneralEnigmaSchema(key string) []function.EnigmaSchema {
	return []function.EnigmaSchema{
		{
			Method: function.AES,
			Key:    func() string { return key }, // Layer 1: AES with original key
		},
		{
			Method: function.AES,
			Key:    func() string { return function.ReverseStrings(key) }, // Layer 2: AES with reversed key
		},
		{
			Method: function.AES,
			Key:    func() string { return key[:len(key)/2] }, // Layer 3: AES with first half of the key
		},
		{
			Method: function.AES,
			Key:    func() string { return key[len(key)/2:] }, // Layer 4: AES with second half of the key
		},
		{
			Method: function.Base64, // Layer 5: Base64 Encoding
		},
	}
}
