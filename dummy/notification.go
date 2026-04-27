package dummy

import (
	notification "react-go/modules/notification/model"
	"react-go/types"
	"time"
)

var Notifications = []types.Notification{
	{
		ID:   "notif-1",
		Type: notification.NotificationTypeSuccess,
		Title: types.Language{
			Id: "Login berhasil",
			En: "Login successful",
		},
		Message: types.Language{
			Id: "Anda telah masuk dari perangkat baru.",
			En: "You have logged in from a new device.",
		},
		Timestamp: time.Now().Add(-2 * time.Minute).Format(time.RFC3339),
		IsRead:    false,
	},
	{
		ID:   "notif-2",
		Type: notification.NotificationTypeWarning,
		Title: types.Language{
			Id: "Kapasitas hampir penuh",
			En: "Storage almost full",
		},
		Message: types.Language{
			Id: "Penyimpanan database telah mencapai 85%. Harap segera lakukan pembersihan.",
			En: "Database storage has reached 85%. Please clean up soon.",
		},
		Timestamp: time.Now().Add(-15 * time.Minute).Format(time.RFC3339),
		IsRead:    false,
	},
	{
		ID:   "notif-3",
		Type: notification.NotificationTypeInfo,
		Title: types.Language{
			Id: "Pengguna baru terdaftar",
			En: "New user registered",
		},
		Message: types.Language{
			Id: "User 'john_doe' baru saja mendaftar ke sistem.",
			En: "User 'john_doe' has just registered to the system.",
		},
		Timestamp: time.Now().Add(-45 * time.Minute).Format(time.RFC3339),
		IsRead:    false,
	},
	{
		ID:   "notif-4",
		Type: notification.NotificationTypeError,
		Title: types.Language{
			Id: "Antrian gagal diproses",
			En: "Queue processing failed",
		},
		Message: types.Language{
			Id: "Antrian 'email_sender' gagal diproses setelah 3 kali percobaan.",
			En: "Queue 'email_sender' failed after 3 retry attempts.",
		},
		Timestamp: time.Now().Add(-2 * time.Hour).Format(time.RFC3339),
		IsRead:    true,
	},
	{
		ID:   "notif-5",
		Type: notification.NotificationTypeSystem,
		Title: types.Language{
			Id: "Pembaruan sistem",
			En: "System update",
		},
		Message: types.Language{
			Id: "Sistem telah diperbarui ke versi terbaru v2.1.0.",
			En: "System has been updated to the latest version v2.1.0.",
		},
		Timestamp: time.Now().Add(-5 * time.Hour).Format(time.RFC3339),
		IsRead:    true,
	},
	{
		ID:   "notif-6",
		Type: notification.NotificationTypeInfo,
		Title: types.Language{
			Id: "Backup selesai",
			En: "Backup completed",
		},
		Message: types.Language{
			Id: "Backup otomatis harian berhasil dilakukan.",
			En: "Daily automatic backup has been completed successfully.",
		},
		Timestamp: time.Now().Add(-12 * time.Hour).Format(time.RFC3339),
		IsRead:    true,
	},
	{
		ID:   "notif-7",
		Type: notification.NotificationTypeSuccess,
		Title: types.Language{
			Id: "Deploy berhasil",
			En: "Deployment successful",
		},
		Message: types.Language{
			Id: "Deployment ke server produksi berhasil tanpa error.",
			En: "Deployment to production server completed without errors.",
		},
		Timestamp: time.Now().Add(-24 * time.Hour).Format(time.RFC3339),
		IsRead:    true,
	},
	{
		ID:   "notif-8",
		Type: notification.NotificationTypeWarning,
		Title: types.Language{
			Id: "SSL akan kedaluwarsa",
			En: "SSL expiring soon",
		},
		Message: types.Language{
			Id: "Sertifikat SSL akan kedaluwarsa dalam 7 hari. Harap segera perbarui.",
			En: "SSL certificate will expire in 7 days. Please renew soon.",
		},
		Timestamp: time.Now().Add(-48 * time.Hour).Format(time.RFC3339),
		IsRead:    true,
	},
}
