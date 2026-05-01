package modules

import (
	"react-go/middlewares"
	"react-go/modules/apikey"
	"react-go/modules/auth"
	"react-go/modules/dashboard"
	"react-go/modules/debounce"
	"react-go/modules/example"
	"react-go/modules/master_data"
	"react-go/modules/notification"
	"react-go/modules/option"
	"react-go/modules/role"
	"react-go/modules/rule"
	"react-go/modules/setting"
	"react-go/modules/user"
	"react-go/modules/whitelist"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, api fiber.Router) {
	// /api
	example.RegisterRoutes(app)

	// /api/auth
	auth.RegisterPublicRoutes(api.Group("/auth"))
	auth.RegisterProtectedRoutes(api.Group("/auth", middlewares.UseToken))

	// User
	user.ProtectedRoute(api.Group("/user", middlewares.UseToken))

	// Role
	role.ProtectedRoute(api.Group("/role", middlewares.UseToken))

	// Rule
	rule.ProtectedRoute(api.Group("/rule", middlewares.UseToken))

	// Master Data
	master_data.ProtectedRoute(api.Group("/master-data", middlewares.UseToken))

	// Notification
	notification.ProtectedRoute(api.Group("/notification", middlewares.UseToken))

	// Whitelist
	whitelist.ProtectedRoute(api.Group("/whitelist", middlewares.UseToken))

	// API Key
	apikey.ProtectedRoute(api.Group("/apikey", middlewares.UseToken))

	// Setting
	setting.ProtectedRoute(api.Group("/setting", middlewares.UseToken))

	// Dashboard
	dashboard.ProtectedRoute(api.Group("/dashboard", middlewares.UseToken))

	// Option
	option.PublicRoute(api.Group("/option"))
	option.ProtectedRoute(api.Group("/option", middlewares.UseToken))

	// Debounce
	debounce.ProtectedRoute(api.Group("/debounce", middlewares.UseToken))
}
