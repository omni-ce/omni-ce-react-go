package modules

import "react-go/worker"

func SetupWorkers() {
	// Start worker manager
	worker.Example{}.Start()
}
