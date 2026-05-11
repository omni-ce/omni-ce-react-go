package product

import "github.com/gofiber/fiber/v2"

func PublicRoute(api fiber.Router) {
	api.Get("/", HelloWorld)
}

func ProtectedRoute(api fiber.Router) {
	// Category
	api.Post("/category/create", CategoryCreate)
	api.Get("/category/paginate", CategoryPaginate)
	api.Put("/category/edit/:id", CategoryEdit)
	api.Delete("/category/remove/:id", CategoryRemove)
	api.Post("/category/bulk-remove", CategoryBulkRemove)
	api.Patch("/category/set-active/:id", CategorySetActive)

	// Type
	api.Post("/type/create", TypeCreate)
	api.Get("/type/paginate", TypePaginate)
	api.Put("/type/edit/:id", TypeEdit)
	api.Delete("/type/remove/:id", TypeRemove)
	api.Post("/type/bulk-remove", TypeBulkRemove)
	api.Patch("/type/set-active/:id", TypeSetActive)

	// Brand
	api.Post("/brand/create", BrandCreate)
	api.Get("/brand/paginate", BrandPaginate)
	api.Put("/brand/edit/:id", BrandEdit)
	api.Delete("/brand/remove/:id", BrandRemove)
	api.Post("/brand/bulk-remove", BrandBulkRemove)
	api.Patch("/brand/set-active/:id", BrandSetActive)

	// Variant
	api.Post("/variant/create", VariantCreate)
	api.Get("/variant/paginate", VariantPaginate)
	api.Put("/variant/edit/:id", VariantEdit)
	api.Delete("/variant/remove/:id", VariantRemove)
	api.Post("/variant/bulk-remove", VariantBulkRemove)
	api.Patch("/variant/set-active/:id", VariantSetActive)

	// Memory
	api.Post("/memory/create", MemoryCreate)
	api.Get("/memory/paginate", MemoryPaginate)
	api.Put("/memory/edit/:id", MemoryEdit)
	api.Delete("/memory/remove/:id", MemoryRemove)
	api.Post("/memory/bulk-remove", MemoryBulkRemove)

	// Color
	api.Post("/color/create", ColorCreate)
	api.Get("/color/paginate", ColorPaginate)
	api.Put("/color/edit/:id", ColorEdit)
	api.Delete("/color/remove/:id", ColorRemove)
	api.Post("/color/bulk-remove", ColorBulkRemove)

	// Item
	api.Post("/item/create", ItemCreate)
	api.Get("/item/paginate", ItemPaginate)
	api.Put("/item/edit/:id", ItemEdit)
	api.Delete("/item/remove/:id", ItemRemove)
	api.Post("/item/bulk-remove", ItemBulkRemove)

	// Item Image
	api.Post("/item/image/set/:item_id", ItemImageSet)
	api.Get("/item/image/list/:item_id", ItemImageList)
	api.Delete("/item/image/remove/:id", ItemImageRemove)
	api.Patch("/item/image/set-primary/:id", ItemImageSetPrimary)

	// Catalog
	api.Post("/catalog/infinite-scroll", CatalogInfiniteScroll)
}
