package function

import "fmt"

func ToIDR(amount float64) string {
	intAmount := int64(amount)
	s := fmt.Sprintf("%d", intAmount)
	n := len(s)
	if n <= 3 {
		return s
	}
	var result []byte
	for i, c := range s {
		if (n-i)%3 == 0 && i != 0 {
			result = append(result, '.')
		}
		result = append(result, byte(c))
	}
	return string(result)
}
