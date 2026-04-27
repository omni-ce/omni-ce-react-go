package modules

import (
	"react-go/middlewares"
	"react-go/modules/apikey"
	"react-go/modules/auth"
	"react-go/modules/dashboard"
	"react-go/modules/example"
	"react-go/modules/notification"
	"react-go/modules/setting"
	"react-go/modules/user"
	"react-go/modules/whitelist"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, api fiber.Router) {
	// /api
	example.RegisterRoutes(api)

	// /api/auth
	auth.RegisterPublicRoutes(api.Group("/auth"))
	auth.RegisterProtectedRoutes(api.Group("/auth", middlewares.UseToken))

	// User
	user.ProtectedRoute(api.Group("/user", middlewares.UseToken))
	user.ManagementRoute(api.Group("/user", middlewares.UseToken))

	// Notification
	notification.ProtectedRoute(api.Group("/notification", middlewares.UseToken))

	// /api/whitelist
	whitelist.ProtectedRoute(api.Group("/whitelist", middlewares.UseToken))

	// /api/apikey
	apikey.ProtectedRoute(api.Group("/apikey", middlewares.UseToken))

	// /api/setting
	setting.ProtectedRoute(api.Group("/setting", middlewares.UseToken))

	// /api/dashboard
	dashboard.ProtectedRoute(api.Group("/dashboard", middlewares.UseToken))
}
