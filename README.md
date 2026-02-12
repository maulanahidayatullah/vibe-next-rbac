# LanDev - Enterprise Full-Stack Portfolio

A full-stack enterprise-ready multi-tenant administration portal built with **Next.js 15**, featuring a futuristic glassmorphism UI, role-based access control, and internationalization.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Sequelize ORM |
| **Auth** | JWT (access + refresh tokens) |
| **State** | Zustand (persisted) |
| **Styling** | TailwindCSS v4 + shadcn/ui |
| **Animations** | Framer Motion |
| **i18n** | next-intl (ID/EN/JA) |
| **UI** | Glassmorphism + 4-color theming |

## ✨ Features

- **Multi-Tenant Architecture** — Isolated tenant environments with dedicated settings
- **RBAC (Role-Based Access Control)** — Fine-grained permissions per role, menu visibility based on permissions
- **4-Color Theme System** — Blue, Red, Yellow, Green with full Light/Dark palettes
- **Internationalization** — Indonesian (default), English, Japanese
- **JWT Authentication** — Access + Refresh token rotation
- **Superadmin Lock** — Superadmin cannot be deleted or stripped of permissions
- **Paranoid Soft Deletes** — Safe deletion on Users, Roles, Settings, Tenants
- **Activity Logging** — All CRUD operations, login/logout tracked
- **Futuristic UI** — Glassmorphism, gradient accents, animated transitions, loading skeletons
- **Responsive Design** — Mobile-first with collapsible sidebar

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # Backend API route handlers
│   │   ├── auth/               # Login, Logout, Refresh, Me
│   │   ├── tenants/            # Tenant CRUD
│   │   ├── users/              # User CRUD
│   │   ├── roles/              # Role CRUD
│   │   ├── permissions/        # List permissions
│   │   ├── settings/           # Settings CRUD
│   │   └── activity-logs/      # Activity logs
│   ├── dashboard/              # Protected dashboard pages
│   │   ├── tenants/            # Tenant management
│   │   ├── users/              # User management
│   │   ├── roles/              # Role management
│   │   └── settings/           # Theme & language settings
│   ├── login/                  # Login page
│   ├── globals.css             # Theme system (4 colors × light/dark)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── layout/                 # Navbar, Sidebar, Skeletons
│   ├── providers/              # Auth, Theme, i18n providers
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth/                   # JWT, middleware, activity logger
│   ├── db/
│   │   ├── config.js           # Sequelize config
│   │   ├── migrations/         # Database migrations
│   │   ├── models/             # Sequelize models
│   │   └── seeders/            # Default data seeders
│   ├── api-client.ts           # Frontend API client
│   └── utils.ts                # Utility functions
├── messages/                   # i18n translations
│   ├── id.json                 # Indonesian
│   ├── en.json                 # English
│   └── ja.json                 # Japanese
├── stores/
│   ├── auth-store.ts           # Auth state + permissions
│   └── settings-store.ts       # Theme, language, sidebar, tenant
├── i18n.ts                     # next-intl config
└── middleware.ts               # Next.js route middleware
```

## 🔧 Setup

### Prerequisites
- Node.js 24+
- PostgreSQL 14+
- npm

### Installation

```bash
# 1. Clone and install
npm install

# 2. Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# 3. Create database
createdb next_fullstack

# 4. Run migrations
npx sequelize-cli db:migrate

# 5. Run seeders
npx sequelize-cli db:seed:all

# 6. Start development server
npm run dev
```

### Default Login
- **Email:** admin@example.com
- **Password:** admin123

## 🎨 Theme System

The app supports 4 theme colors, each with full light and dark palettes:

| Theme | Light | Dark |
|-------|-------|------|
| 🔵 Blue | Soft azure | Deep navy |
| 🔴 Red | Warm coral | Rich crimson |
| 🟡 Yellow | Golden amber | Deep gold |
| 🟢 Green | Fresh emerald | Forest green |

Themes are **tenant-bound** — each tenant can have its own theme.
When a user logs in, the tenant's theme is applied globally.
Guests use the default theme (blue).

## 🔐 RBAC Permissions

| Module | Permissions |
|--------|------------|
| Dashboard | View |
| Tenants | View, Create, Edit, Delete (superadmin only) |
| Users | View, Create, Edit, Delete |
| Roles | View, Create, Edit, Delete |
| Settings | View, Edit |
| Activity Logs | View |

## 🌐 i18n Languages

- 🇮🇩 Indonesian (default)
- 🇺🇸 English
- 🇯🇵 Japanese

## 📦 Database Models

- **Tenants** — Multi-tenant isolation
- **Users** — With superadmin flag, soft delete
- **Roles** — Tenant-bound, soft delete
- **Permissions** — Global permission definitions
- **RolePermissions** — Many-to-many Role ↔ Permission
- **UserRoles** — Many-to-many User ↔ Role
- **Settings** — Tenant-bound key-value store
- **ActivityLogs** — Audit trail

## 📜 License

MIT
