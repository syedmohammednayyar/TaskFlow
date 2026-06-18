# TaskFlow

> **Manage. Assign. Complete.**
> A modern, collaborative task-management platform for small teams — built with Next.js 15, Supabase, and a polished, mobile-first UI.

TaskFlow lets any user sign up, create tasks, assign them to teammates, track progress on a list or Kanban board, and stay in the loop with in-app notifications.

---

## ✨ Features

- **Authentication** — email/password sign-up & login with NextAuth (Credentials), hashed passwords (bcrypt), protected dashboard routes via middleware.
- **Dashboard** — animated stat cards (Total, Assigned to Me, Completed, Overdue), a progress overview bar, and recent activity.
- **Task management** — full create / read / update / delete, with title, description, priority, status, due date, and assignee.
- **Assignment** — assign any task to any registered user; assignees see it instantly under **Assigned to Me**.
- **Two views** — a professional **list/table** view and a drag-and-drop **Kanban board** (Todo · In Progress · Completed) with smooth animations.
- **My Tasks / Assigned to Me** — scoped pages with search + status/priority filters.
- **Notifications** — in-app notifications for assigned / completed / updated tasks, with an unread badge and "mark all read".
- **Search & filters** — real-time, debounced search by title/description plus combinable status & priority filters.
- **Polish** — light/dark mode with persistence, skeleton loading states, friendly empty states, toast notifications, accessible Radix primitives, and responsive layouts everywhere.

---

## 🧱 Tech stack

| Layer         | Technology                                        |
| ------------- | ------------------------------------------------- |
| Framework     | Next.js 15 (App Router) — **JavaScript, no TS**   |
| Styling       | Tailwind CSS + shadcn-style components            |
| UI primitives | Radix UI, lucide-react icons                      |
| Animation     | Framer Motion                                     |
| Drag & drop   | @dnd-kit                                          |
| Data fetching | SWR                                               |
| Toasts        | sonner                                            |
| Theme         | next-themes                                       |
| Auth          | NextAuth / Auth.js (Credentials)                  |
| Database      | Supabase (PostgreSQL) + Prisma ORM                |
| Validation    | Zod                                               |

---

## 🚀 Getting started

### 1. Prerequisites
- Node.js 18.18+ (tested on Node 24)
- A free [Supabase](https://supabase.com) project

### 2. Install
```bash
npm install
```

### 3. Configure environment
Copy the example file and fill in your values:
```bash
cp .env.example .env.local
```

```env
# Pooled connection (used at runtime via pgbouncer)
DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
# Direct connection (used by Prisma migrate)
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"

NEXTAUTH_SECRET="<a long random string>"   # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

Find `<project-ref>` and `<password>` in your Supabase dashboard under **Project Settings → Database**.

### 4. Push the database schema
```bash
npx prisma migrate dev --name init
```

### 5. Run
```bash
npm run dev          # http://localhost:3000
```

Create two accounts (e.g. in two browsers) to try the full assignment + notification flow.

### 6. Production build
```bash
npm run build
npm start
```

---

## 📁 Project structure

```
src/
├── app/
│   ├── (auth)/                 # login & signup (redirects authed users away)
│   │   ├── login/  signup/
│   ├── (dashboard)/            # protected app shell (sidebar + topbar)
│   │   ├── dashboard/          # stats + recent tasks
│   │   ├── tasks/  tasks/[id]/ # all tasks (list/kanban) + details
│   │   ├── kanban/  my-tasks/  assigned/
│   │   └── layout.js  loading.js
│   ├── api/                    # route handlers
│   │   ├── auth/[...nextauth]/ auth/signup/
│   │   ├── tasks/  tasks/[id]/
│   │   ├── users/  stats/  health/
│   │   └── notifications/  notifications/[id]/
│   ├── layout.js  page.js  providers.jsx  globals.css
│   ├── error.js  not-found.js
├── components/
│   ├── ui/                     # shadcn-style primitives (button, dialog, select…)
│   ├── layout/                 # sidebar, topbar, notifications, user menu, logo
│   ├── dashboard/              # stat card + dashboard content
│   ├── tasks/                  # form, table, card, kanban, filters, detail…
│   ├── auth/                   # login & signup forms
│   └── shared/                 # empty state, theme toggle, confirm dialog…
├── hooks/                      # SWR hooks + useDebounce
├── lib/                        # prisma client, auth, validations, api helpers, utils
└── middleware.js               # protects dashboard routes + CSP headers
prisma/
└── schema.prisma               # Prisma data model (User, Task, Notification, Comment, Activity)
```

---

## 🗃️ Data model

**User** — `name, email, password (hashed, never returned), avatar (auto-generated), role, isActive, lastLogin, timestamps`  
**Task** — `title, description, priority (Low|Medium|High), status (Todo|In Progress|Completed), dueDate, createdBy → User, assignedTo → User, completedAt, archived, timestamps`  
**Notification** — `userId → User, type, message, task → Task, actor → User, isRead, readAt, timestamps`  
**Comment** — `taskId → Task, authorId → User, body, editedAt, timestamps`  
**Activity** — `taskId → Task, actorId → User, type, metadata, timestamps`

---

## 🔐 Authorization rules

- Any authenticated user can **view** a task they created or are assigned to.
- Only the **creator** can edit core details, reassign, or delete a task.
- The **assignee** (or creator) can change a task's **status** (including via Kanban drag).
- Notifications are generated automatically on assignment, completion, and status changes — never for your own actions.

---

## ☁️ Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com).
3. Add the environment variables (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` = your production URL).
4. In Supabase, ensure your project allows connections from Vercel's IP ranges (or use the pooled connection string which works everywhere).
5. Deploy — that's it.

---

Built as a production-quality MVP. Manage. Assign. Complete. ✅
