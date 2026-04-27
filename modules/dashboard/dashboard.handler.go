package dashboard

import (
	"react-go/dto"
	"react-go/variable"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DashboardStats struct {
	TotalQueues    int64 `json:"total_queues"`
	TotalMessages  int64 `json:"total_messages"`
	TotalCompleted int64 `json:"total_completed"`
	TotalFailed    int64 `json:"total_failed"`
	TotalTiming    int64 `json:"total_timing"`
	TotalPending   int64 `json:"total_pending"`
}

func GetStats(c *fiber.Ctx) error {
	var stats DashboardStats

	db := variable.Db.Session(&gorm.Session{Logger: logger.Default.LogMode(logger.Silent)}) // silent mode to avoid noise

	// Total queues
	db.Table("queues").Count(&stats.TotalQueues)

	// Total messages (all statuses)
	db.Table("queue_messages").Count(&stats.TotalMessages)

	// Count by status
	db.Table("queue_messages").Where("status = ?", "completed").Count(&stats.TotalCompleted)
	db.Table("queue_messages").Where("status = ? AND is_ack = false", "failed").Count(&stats.TotalFailed)
	db.Table("queue_messages").Where("status = ?", "timing").Count(&stats.TotalTiming)
	db.Table("queue_messages").Where("status = ?", "pending").Count(&stats.TotalPending)

	return dto.OK(c, "Dashboard stats retrieved successfully", stats)
}
