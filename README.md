# Relivex Employee Centre
### Full MEAN Stack Application — Angular · Node.js · Express.js · MongoDB

---

## Project Structure

```
relivex-employee/
├── backend/                          # Node.js + Express API
│   ├── config/
│   │   ├── priority.js               ← Priority calculation engine (range-based)
│   │   └── notification.service.js   ← Email + Slack + in-app notifications
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── expense.controller.js     ← Full 3-tier approval workflow
│   │   ├── job.controller.js
│   │   ├── query.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js        ← JWT + role-based guards
│   │   └── upload.middleware.js      ← Multer photo uploads
│   ├── models/
│   │   ├── Employee.js               ← Mongoose schema + bcrypt
│   │   ├── Expense.js                ← Full approval pipeline schema
│   │   ├── Job.js
│   │   ├── Notification.js
│   │   └── Query.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── expense.routes.js
│   │   ├── job.routes.js
│   │   ├── notification.routes.js
│   │   ├── query.routes.js
│   │   └── user.routes.js
│   ├── uploads/                      ← Employee photos (auto-created)
│   ├── .env.example                  ← Copy to .env and fill in values
│   ├── package.json
│   ├── seed.js                       ← MongoDB seed with 12 employees + data
│   └── server.js
│
├── frontend/                         # Angular 17 app
│   └── src/
│       ├── app/
│       │   ├── components/
│       │   │   ├── app-layout/       ← Shell with sidebar + topbar
│       │   │   ├── sidebar/          ← Role-aware navigation
│       │   │   └── topbar/           ← Page title + notification bell
│       │   ├── guards/               ← AuthGuard, RoleGuard, GuestGuard
│       │   ├── pages/
│       │   │   ├── auth/login        ← Employee ID + password login
│       │   │   ├── auth/register     ← 8-field registration + photo upload
│       │   │   ├── dashboard         ← Role-aware stats + quick actions
│       │   │   ├── profile           ← View + edit profile
│       │   │   ├── career            ← Job listings + recommended
│       │   │   ├── query             ← Submit + track queries
│       │   │   ├── expense           ← Submit + live priority preview
│       │   │   └── approvals/
│       │   │       ├── manager       ← Approve/reject with priority display
│       │   │       ├── finance       ← Auto-decision with confirmation
│       │   │       ├── ceo           ← Final approval + full timeline
│       │   │       └── result        ← Approved/rejected result page
│       │   ├── services/
│       │   │   ├── api.service.ts    ← All HTTP calls
│       │   │   ├── auth.service.ts   ← Auth state management
│       │   │   └── auth.interceptor.ts ← JWT injection
│       │   ├── app.module.ts
│       │   └── app-routing.module.ts
│       ├── assets/styles/
│       │   └── global.scss           ← Relivex brand: Syne + DM Sans + #1752e8
│       └── environments/
│           └── environment.ts
│
└── Relivex_API.postman_collection.json   ← Import into Postman for testing
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Angular CLI: `npm install -g @angular/cli`

---

### 1. Backend Setup

```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS, SLACK_WEBHOOK_URL

# Seed the database with sample data
npm run seed

# Start the server
npm run dev
# → API running at http://localhost:5000
```

**Seed credentials (all passwords: `password123`)**

| Role     | Employee ID | Country | Salary   |
|----------|-------------|---------|----------|
| CEO      | RLX001      | India   | 500,000  |
| Finance  | RLX002      | India   | 200,000  |
| Manager  | RLX003      | India   | 150,000  |
| Manager  | RLX004      | US      | 180,000  |
| Employee | RLX005      | India   | 110,000  | ← High priority eligible
| Employee | RLX006      | India   | 85,000   | ← Medium priority eligible
| Employee | RLX007      | India   | 55,000   | ← Low priority eligible
| Employee | RLX009      | US      | 160,000  | ← US High priority eligible
| Employee | RLX010      | US      | 105,000  | ← US Medium priority eligible

---

### 2. Frontend Setup

```bash
cd frontend
npm install
ng serve
# → App running at http://localhost:4200
```

---

## API Reference

### Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

| Method | Endpoint                          | Auth Required | Role          |
|--------|-----------------------------------|---------------|---------------|
| POST   | `/auth/register`                  | No            | —             |
| POST   | `/auth/login`                     | No            | —             |
| GET    | `/auth/me`                        | Yes           | Any           |
| GET    | `/dashboard`                      | Yes           | Any           |
| GET    | `/users/profile`                  | Yes           | Any           |
| PUT    | `/users/profile`                  | Yes           | Any           |
| GET    | `/jobs`                           | Yes           | Any           |
| GET    | `/jobs/recommended`               | Yes           | Any           |
| POST   | `/query`                          | Yes           | Any           |
| GET    | `/query/my`                       | Yes           | Any           |
| GET    | `/query/all`                      | Yes           | Manager+      |
| POST   | `/expense`                        | Yes           | Any           |
| GET    | `/expense/my`                     | Yes           | Any           |
| GET    | `/expense/all`                    | Yes           | Manager+      |
| GET    | `/expense/pending-manager`        | Yes           | Manager+      |
| GET    | `/expense/pending-finance`        | Yes           | Finance+      |
| GET    | `/expense/pending-ceo`            | Yes           | CEO           |
| GET    | `/expense/:id`                    | Yes           | Any           |
| PUT    | `/expense/:id/manager`            | Yes           | Manager       |
| PUT    | `/expense/:id/finance`            | Yes           | Finance       |
| PUT    | `/expense/:id/ceo`                | Yes           | CEO           |
| GET    | `/notifications`                  | Yes           | Any           |
| PUT    | `/notifications/mark-all-read`    | Yes           | Any           |
| PUT    | `/notifications/:id/read`         | Yes           | Any           |

---

## Priority Engine

### Manager Priority Calculation (range-based)

**India:**
```
amount > 10000 AND amount ≤ 100000 AND salary ≥ 100000  →  High
amount > 5000  AND amount ≤ 50000  AND salary ≥ 80000   →  Medium
amount > 5000  AND amount ≤ 35000  AND salary ≥ 50000   →  Low
else                                                     →  Default
```

**US:**
```
amount > 10000 AND amount ≤ 80000  AND salary ≥ 150000  →  High
amount > 8000  AND amount ≤ 50000  AND salary ≥ 100000  →  Medium
amount > 5000  AND amount ≤ 40000  AND salary ≥ 80000   →  Low
else                                                     →  Default
```

### Finance Auto-Decision
```
High priority           →  Approved
Medium AND order ≤ 2   →  Approved
Low    AND order = 1   →  Approved
Low    AND order = 2   →  Rejected
Default                →  Rejected
```

### CEO Decision (rule-validated)
```
High priority                                       →  Approved
Medium AND order = 1                               →  Approved
Medium AND order = 2 AND India AND salary ≥ 100000 →  Approved
else                                               →  Rejected
```

---

## Postman Testing

1. Open Postman → Import → select `Relivex_API.postman_collection.json`
2. Run requests in order under **"Expense — Full Workflow"** folder
3. Tokens are auto-saved as collection variables after login
4. Run **"Priority Engine Tests"** to verify range-based logic

---

## Notifications

Configure in `.env`:

**Email (NodeMailer + Gmail):**
1. Enable 2FA on your Gmail account
2. Create an App Password at myaccount.google.com/apppasswords
3. Set `EMAIL_USER` and `EMAIL_PASS` in `.env`

**Slack:**
1. Create a Slack App at api.slack.com
2. Enable Incoming Webhooks
3. Copy webhook URL to `SLACK_WEBHOOK_URL` in `.env`

---

## MongoDB Collections

| Collection    | Purpose                                   |
|---------------|-------------------------------------------|
| employees     | User accounts with roles and salary info  |
| expenses      | Full expense pipeline with approval stages|
| queries       | Employee queries and admin responses      |
| jobs          | Career listings for the Career page       |
| notifications | In-app notification messages              |

---

## Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | Angular 17, Reactive Forms, RxJS      |
| Backend   | Node.js 18, Express 4, REST API       |
| Database  | MongoDB Atlas, Mongoose ODM           |
| Auth      | JWT (7-day expiry), bcryptjs          |
| Upload    | Multer (5MB limit, images only)       |
| Email     | NodeMailer + Gmail SMTP               |
| Slack     | Incoming Webhooks                     |
| Fonts     | Syne (headings) + DM Sans (body)      |
| Theme     | Matches Relivex CRM (#1752e8 primary) |

---

© 2026 Relivex Technologies Pvt. Ltd.
