# GitHub Copilot System Instructions for TimeWise HRMS

## Project Overview
TimeWise HRMS is an enterprise-grade Leave Management System built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM**, **PostgreSQL (Supabase)**, **Material-UI (MUI v5)**, **NextAuth.js**, and **Zod**.

---

## 🛠️ Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database & ORM:** PostgreSQL + Prisma ORM v6
- **UI & Styling:** Material-UI (MUI v5) + Emotion + Next.js App Router setup
- **Authentication:** NextAuth.js (Credentials Provider with JWT sessions & bcryptjs)
- **Validation:** Zod schemas for client forms & API payloads
- **Rate Limiting:** Upstash Redis (`@upstash/redis`)
- **Email Services:** Resend & Nodemailer (`@react-email/components`)
- **Testing:** Jest with SWC (`jest.config.node.js` for API/Node, `jest.config.react.js` for React UI)

---

## 📁 Key Project Structure & Conventions
- `app/` - Next.js App Router routes & layouts
  - `app/api/` - Next.js API Route Handlers (`route.ts`)
  - `app/dashboard/` - Employee & Manager Dashboard
  - `app/requests/` - Leave Request pages & components
  - `app/employees/` - Employee Management directory
  - `app/admin/` - System Administration & settings
  - `app/analytics/` - Leave reporting & analytics
- `components/` - Reusable UI Components
  - `components/shared/` - Shared components (Dialogs, DataGrids, Badges)
  - `components/emails/` - React Email templates
- `lib/` - Server & Client Utilities
  - `lib/prisma.ts` - Singleton Prisma client instance
  - `lib/auth.ts` - NextAuth configuration & auth helpers
  - `lib/ratelimit.ts` - Upstash Redis rate limiting rules
  - `lib/email.ts` - Resend & Nodemailer integration
- `prisma/` - Database schema (`schema.prisma`) and seed scripts (`seed.ts`)
- `__tests__/` - Jest test files categorized into `api/` and `components/`

---

## 📐 Architecture Rules & Guidelines

### 1. Next.js App Router & Server Components
- Default to **Server Components** whenever possible.
- Use `"use client";` directive explicitly at the top of client components requiring state, MUI interactive components, hooks, or event listeners.
- Keep Client Components lean by moving data fetching and mutation logic to Server Actions or API routes.

### 2. Database & Prisma ORM
- Always import the Prisma client instance from `@/lib/prisma` (`prisma`). Do NOT instantiate `new PrismaClient()` in individual files.
- When creating schema migrations:
  - Model enums should be capitalized or match existing enum conventions (e.g., `Role`: `admin` | `user`, `LeaveType`: `Annual` | `Sick` | `Unpaid` | `Other`, `LeaveStatus`: `Pending` | `Approved` | `Rejected`).
  - Map field names with `@map()` or snake_case table names with `@@map()` when specified in `schema.prisma`.

### 3. API Route Development (`app/api/.../route.ts`)
- Validate request inputs using **Zod** schemas before processing.
- Perform session authentication using `getServerSession(authOptions)` from `@/lib/auth`.
- Enforce role-based access control (RBAC): verify `session.user.role === 'admin'` for admin-only endpoints.
- Apply rate limiting using Upstash Redis where appropriate.
- Use standard HTTP status codes:
  - `200 OK` / `201 Created`
  - `400 Bad Request` (Zod validation failures)
  - `401 Unauthorized` (Missing session)
  - `403 Forbidden` (Insufficient role/permissions)
  - `429 Too Many Requests` (Rate limit reached)
  - `500 Internal Server Error` (Unhandled errors)
- Return JSON responses formatted consistently: `{ data, message, error }`.

### 4. UI & MUI Styling Standards
- Prefer Material-UI components (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`).
- Maintain consistent theme usage (`useTheme`, `sx` prop, responsive breakpoints).
- Ensure accessible forms with full validation feedback (helper text, visual error states).

### 5. Testing & Validation
- Write Node tests for API routes under `__tests__/api/` (run with `npm run test:api`).
- Write React Component tests under `__tests__/components/` (run with `npm run test:react`).
- Ensure all types strictly resolve without errors (`npm run type-check`).

---

## 💡 Code Generation Prompts Guidelines
When asked to implement new features, generate code that:
1. Strictly adheres to TypeScript types defined in `prisma/schema.prisma` and `@/types/`.
2. Includes robust error handling and user-friendly error messages.
3. Implements defensive authorization checks on both API routes and UI components.
4. Includes corresponding unit tests or API tests where appropriate.
