# CACMDesa Next.js Migration

This is the Next.js migration of CACMDesa (Continuous Audit Continuous Monitoring) for village financial management.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma** - ORM for SQL Server
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **React Hook Form + Zod** - Form handling and validation

## Getting Started

### Prerequisites

- Node.js 18+
- SQL Server (local or remote)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Edit `.env.local` with your database credentials:
```
DATABASE_URL="sqlserver://localhost:1433;database=Siswaskeudes_Baru;user=sa;password=YourPassword;encrypt=false;trustServerCertificate=true"
NEXTAUTH_SECRET="your-secret-key"
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed initial data (creates admin user)
npm run prisma:seed

# Or run all at once:
npm run db:setup
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

After running the seed script, you can login with:
- Username: `admin`
- Password: `admin123`

## Project Structure

```
cacmdesa-next/
├── app/
│   ├── (auth)/          # Authentication pages (login, register)
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── admin/        # Admin-only pages
│   │   ├── atensi/       # Atensi module
│   │   ├── dashboard/    # Main dashboard
│   │   └── inspection/   # Inspection module
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth API
│   │   ├── atensi/       # Atensi endpoints
│   │   └── dashboard/    # Dashboard endpoints
│   └── providers.tsx     # React Query & NextAuth providers
├── components/           # Reusable components
├── lib/                  # Utilities and helpers
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Seed script
├── types/               # TypeScript type definitions
└── middleware.ts        # Authentication middleware
```

## Available Scripts

```bash
# Development
npm run dev           # Start development server

# Build
npm run build         # Build for production
npm run start         # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema changes to database
npm run prisma:seed      # Seed database with initial data
npm run db:setup         # Run all database setup commands

# Code Quality
npm run lint          # Run ESLint
```

## Features Implemented

✅ Authentication with NextAuth.js
✅ Role-based access control
✅ Fiscal year selection
✅ Protected routes with middleware
✅ Prisma ORM setup for SQL Server
✅ Basic dashboard structure
✅ Login page
✅ Session management

## Migration Status

This is a migration from ASP.NET Web Forms to Next.js. Original system: 42 ASPX pages, DevExpress UI, SQL Server database.
