package environment

import (
	"github.com/denisbrodbeck/machineid"
)

func GetMachineId() string {
	id, err := machineid.ID()
	if err != nil {
		return GetSecretKey()
	}
	return id
}
