package worker

import (
	"log"
)

const debug = true

type Example struct{}

func (Example) Start() {
	log.Println("🚀 Example worker started")
}
