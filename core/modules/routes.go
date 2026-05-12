package modules

import (
	"react-go/core/middlewares"
	"react-go/core/modules/address"
	"react-go/core/modules/apikey"
	"react-go/core/modules/auth"
	"react-go/core/modules/captcha"
	"react-go/core/modules/company"
	"react-go/core/modules/dashboard"
	"react-go/core/modules/debounce"
	"react-go/core/modules/event"
	"react-go/core/modules/example"
	"react-go/core/modules/master_data"
	"react-go/core/modules/notification"
	"react-go/core/modules/option"
	"react-go/core/modules/product"
	"react-go/core/modules/role"
	"react-go/core/modules/rule"
	"react-go/core/modules/setting"
	"react-go/core/modules/supplier"
	"react-go/core/modules/upload"
	"react-go/core/modules/user"
	"react-go/core/modules/warehouse"
	"react-go/core/modules/whitelist"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, api fiber.Router) {
	// ------------------------------------------------------------------- //
	// ------------------------------------------------------------------- //

	// Root (Hello World)
	example.PublicRoute(app)

	// Upload
	upload.ProtectedRoute(api.Group("/upload", middlewares.UseToken))

	// Captcha
	captcha.PublicRoute(api.Group("/captcha"))

	// Address
	address.PublicRoute(api.Group("/address"))

	// ------------------------------------------------------------------- //
	// ------------------------------------------------------------------- //

	// Event
	event.ProtectedRoute(api.Group("/event", middlewares.UseQueryToken))

	// Notification
	notification.ProtectedRoute(api.Group("/notification", middlewares.UseToken))

	// ------------------------------------------------------------------- //
	// ------------------------------------------------------------------- //

	// Option
	option.PublicRoute(api.Group("/option"))
	option.ProtectedRoute(api.Group("/option", middlewares.UseToken))

	// Debounce
	debounce.ProtectedRoute(api.Group("/debounce", middlewares.UseToken))

	// ------------------------------------------------------------------- //
	// ------------------------------------------------------------------- //

	// Auth
	auth.PublicRoute(api.Group("/auth"))
	auth.ProtectedRoute(api.Group("/auth", middlewares.UseToken))

	// Setting
	setting.ProtectedRoute(api.Group("/setting", middlewares.UseToken))

	// User
	user.ProtectedRoute(api.Group("/user", middlewares.UseToken))

	// Role
	role.ProtectedRoute(api.Group("/role", middlewares.UseToken))

	// Rule
	rule.ProtectedRoute(api.Group("/rule", middlewares.UseToken))

	// Whitelist
	whitelist.ProtectedRoute(api.Group("/whitelist", middlewares.UseToken))

	// API Key
	apikey.ProtectedRoute(api.Group("/apikey", middlewares.UseToken))

	// ------------------------------------------------------------------- //
	// ------------------------------------------------------------------- //

	// Dashboard
	dashboard.PublicRoute(api.Group("/dashboard"))
	dashboard.ProtectedRoute(api.Group("/dashboard", middlewares.UseToken))

	// Master Data
	master_data.ProtectedRoute(api.Group("/master-data", middlewares.UseToken))

	// Company
	company.ProtectedRoute(api.Group("/company", middlewares.UseToken))

	// Product
	product.PublicRoute(api.Group("/product"))
	product.ProtectedRoute(api.Group("/product", middlewares.UseToken))

	// Supplier
	supplier.ProtectedRoute(api.Group("/supplier", middlewares.UseToken))

	// Warehouse
	warehouse.ProtectedRoute(api.Group("/warehouse", middlewares.UseToken))

	// ------------------------------------------------------------------- //
	// ------------------------------------------------------------------- //
}
