# Omni-CE ERP

> Modern Open Source ERP Platform built with React and Golang.

Omni-CE ERP is a modern, fast, and scalable open source ERP platform designed for developers and businesses that need a production-ready enterprise system with a modern technology stack and clean architecture.

Built using React 19, Golang, Fiber, GORM, and TailwindCSS v4, Omni-CE ERP focuses on developer experience, modularity, maintainability, and high performance.

---

# Overview

Omni-CE ERP is designed for building:

- ERP systems
- CRM platforms
- HRIS applications
- Inventory systems
- POS systems
- Internal business tools
- Enterprise dashboards
- SaaS applications

The project provides a production-ready starter foundation with authentication, role management, theming, multi-language support, responsive dashboard layouts, and Docker deployment support.

---

# Features & Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS v4
- Zustand
- React Router
- VitePWA

### Included Features

- Responsive dashboard layout
- Sidebar & topbar navigation
- Dark / light mode
- Multi-language support
- Theme system
- Protected routes
- Authentication pages
- Role-based navigation
- PWA support

---

## Backend

- Golang
- Fiber v2
- GORM ORM
- JWT Authentication
- REST API architecture
- Server-Sent Events (SSE)

### Database Support

- SQLite
- PostgreSQL
- MySQL

### Included Features

- JWT authentication
- Role-based access control
- Auto database migration
- Modular service architecture
- Real-time event support
- Environment configuration

---

## Infrastructure

- Docker
- Docker Compose
- Production-ready deployment
- Reverse proxy compatible

---

# Project Structure

Berikut adalah struktur folder utama dari proyek ini:

```text
.
├── core/                   # Backend Logic (Go / Fiber Framework)
│   ├── database/           # Database configurations and migrations
│   ├── dto/                # Data Transfer Objects
│   ├── enigma/             # Encryption & Security utilities
│   ├── environment/        # Environment configurations
│   ├── function/           # Helper functions
│   ├── middlewares/        # Fiber middlewares (Auth, CORS, etc.)
│   ├── modules/            # Domain-driven modules
│   │   ├── auth/           # Authentication module
│   │   ├── master_data/    # Master data management
│   │   ├── product/        # Product management
│   │   ├── user/           # User & Role management
│   │   └── ...             # Other business modules
│   └── server.go           # Backend entry point
│
├── src/                    # Frontend Application (React + Vite)
│   ├── assets/             # Static assets (images, icons)
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   └── widget/         # Complex UI widgets
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layouts (App, Auth, Public)
│   ├── lib/                # Library configurations & utilities
│   ├── pages/              # Application pages
│   │   ├── app/            # Protected application pages
│   │   ├── auth/           # Login, Register, Forgot Password
│   │   └── system/         # System configuration pages
│   ├── services/           # API service integrations
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript definitions
│   └── main.tsx            # Frontend entry point
│
├── public/                 # Static files for web server
├── tests/                  # End-to-end tests
├── uploads/                # Uploaded files storage
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── go.mod                  # Go dependencies
├── package.json            # Node.js dependencies
└── vite.config.ts          # Vite configuration
```

---

## Backend (`core/`)

This sector handles the entire server-side application using Golang and Fiber framework.

Built with modular architecture for scalability and maintainability.

### Includes

- Authentication system
- Middleware management
- Database integration
- Modular business domains
- Security utilities
- Environment management

---

## Frontend (`src/`)

Built using React, TypeScript, and Vite with a modern frontend architecture focused on scalability and developer experience.

### Includes

- Reusable UI components
- Responsive layouts
- Zustand state management
- Route management
- Theme system
- Multi-language support

---

## Database

Using GORM as the primary ORM with automatic migration support.

### Supported Databases

- SQLite
- PostgreSQL
- MySQL

---

# Quick Start

## Clone Repository

```bash
git clone https://github.com/omni-ce/omni-ce-react-go.git .
```

---

## Initialize Project

```bash
bash initialize.sh
```

---

## Run Frontend

```bash
bun run dev
```

---

## Run Backend

```bash
air
```

---

# Minimum Requirements

| Requirement | Version  |
| ----------- | -------- |
| Node.js     | 20.20.2+ |
| Bun         | 1.3.6+   |
| Go          | 1.25.6+  |

---

# Docker

## Docker Compose

Run the entire application stack using Docker Compose.

```bash
docker compose up -d
```

Stop all containers:

```bash
docker compose down
```

Rebuild containers:

```bash
docker compose up -d --build
```

---

## Standard Docker Usage

### Build Docker Image

```bash
docker build -t omni-ce .
```

---

### Run Container

```bash
docker run -d \
  --name omni-ce \
  -p 3000:3000 \
  -p 5173:5173 \
  omni-ce
```

---

### Stop Container

```bash
docker stop omni-ce
```

---

### Remove Container

```bash
docker rm omni-ce
```

---

# ERP Modules & Roadmap

## Core System

- Authentication
- User Management
- Role & Permission
- Organization Management
- Dashboard
- Settings
- Multi-language
- Theme System

---

## Business Modules

### Planned

- Accounting
- CRM
- HRM
- Inventory
- Procurement
- Sales
- POS
- Warehouse
- Reporting
- Analytics

---

## Future Development

- Plugin system
- Public SDK
- Multi-tenant support
- Marketplace
- Module generator
- Audit log system
- Notification center
- Advanced reporting
- Real-time collaboration

---

# Development Experience

Omni-CE ERP is built for modern developer workflows.

### Highlights

- Instant HMR with Vite
- Fast backend compile with Go
- Type-safe frontend architecture
- Auto reload backend server
- Minimal setup
- Clean modular structure
- Production-ready foundation

---

# Open Source

Omni-CE ERP is fully open source and community-driven.

Contributions are welcome for:

- Features
- Bug fixes
- Documentation
- UI/UX improvements
- ERP modules
- Infrastructure improvements

---

# Contributing

## Setup Development Environment

```bash
git clone https://github.com/your-org/omni-ce.git
cd omni-ce
bash initialize.sh
```

---

## Create Branch

```bash
git checkout -b feature/your-feature
```

---

## Commit Changes

```bash
git commit -m "feat: add new feature"
```

---

## Push Branch

```bash
git push origin feature/your-feature
```

---

# Security

Please report security vulnerabilities responsibly through private communication before opening a public issue.

---

# License

MIT License

---

# Omni-CE ERP

Build modern enterprise applications with React and Golang.
