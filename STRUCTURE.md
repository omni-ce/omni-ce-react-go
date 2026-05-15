# Project Structure

Berikut adalah struktur folder utama dari proyek ini:

```text
.
├── core/                   # Backend Logic (Go / Gin Framework)
│   ├── database/           # Database configurations and migrations
│   ├── dto/                # Data Transfer Objects
│   ├── enigma/             # Encryption & Security utilities
│   ├── environment/        # Environment configurations
│   ├── function/           # Helper functions
│   ├── middlewares/        # Gin middlewares (Auth, CORS, etc.)
│   ├── modules/            # Domain-driven modules
│   │   ├── auth/           # Authentication module
│   │   ├── master_data/    # Master data management
│   │   ├── product/        # Product management
│   │   ├── user/           # User & Role management
│   │   └── ...             # Other business modules
│   └── server.go           # Backend entry point
├── src/                    # Frontend Application (React + Vite)
│   ├── assets/             # Static assets (images, icons)
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Shadcn-like base components
│   │   └── widget/         # Complex UI widgets
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layouts (App, Auth, Public)
│   ├── lib/                # Library configurations & utilities
│   ├── pages/              # Application pages
│   │   ├── app/            # Protected application pages
│   │   ├── auth/           # Login, Register, Forgot Password
│   │   └── system/         # System configuration pages
│   ├── services/           # API service integrations (Axios)
│   ├── stores/             # State management (Zustand)
│   ├── types/              # TypeScript definitions
│   └── main.tsx            # Frontend entry point
├── public/                 # Static files for web server
├── tests/                  # End-to-end tests (Playwright)
├── uploads/                # Directory for uploaded files
├── Dockerfile              # Docker configuration
├── go.mod                  # Go dependencies
├── package.json            # Node.js dependencies
└── vite.config.ts          # Vite configuration
```

## Detail Folder Utama

### Backend (`core/`)
Sektor ini menangani seluruh logika server-side menggunakan bahasa Go. Menggunakan struktur modular agar mudah untuk diskalakan.

### Frontend (`src/`)
Dibangun dengan React dan TypeScript, menggunakan Vite sebagai bundler. Mengikuti pola komponen atomik dan manajemen state menggunakan Zustand.

### Database
Mendukung migrasi otomatis dan menggunakan GORM sebagai ORM utama untuk interaksi dengan database.
