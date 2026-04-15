package modules

import (
	"react-go/middlewares"
	"react-go/modules/apikey"
	"react-go/modules/auth"
	"react-go/modules/dashboard"
	"react-go/modules/example"
	"react-go/modules/setting"
	"react-go/modules/user"
	"react-go/modules/whitelist"
	"react-go/worker"

	"github.com/gofiber/fiber/v2"
)

func SetupWorkers() {
	// Start queue worker manager
	queueWorker := worker.NewManager()
	queueWorker.Start()
}

func SetupRoutes(app *fiber.App, api fiber.Router) {
	// /api
	example.RegisterRoutes(api)

	// /api/auth
	authApi := api.Group("/auth")
	auth.RegisterPublicRoutes(authApi)
	auth.RegisterProtectedRoutes(authApi)

	// User
	user.ProtectedRoute(api.Group("/user", middlewares.UseToken))
	user.ManagementRoute(api.Group("/user", middlewares.UseToken))

	// /api/whitelist (protected)
	whitelistProtected := api.Group("/whitelist", middlewares.UseToken)
	whitelist.RegisterRoutes(whitelistProtected)

	// /api/apikey (protected)
	apikeyProtected := api.Group("/apikey", middlewares.UseToken)
	apikey.RegisterRoutes(apikeyProtected)

	// /api/setting (protected)
	settingProtected := api.Group("/setting", middlewares.UseToken)
	setting.RegisterRoutes(settingProtected)

	// /api/dashboard (protected)
	dashboardProtected := api.Group("/dashboard", middlewares.UseToken)
	dashboard.RegisterRoutes(dashboardProtected)
}
