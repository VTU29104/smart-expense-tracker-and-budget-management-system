# expensetracker — Smart Student Expense Tracker and Budget Management System

> **Smart Student Finance — Spend wisely. Save confidently.**

A production-grade, full-stack student financial management platform built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB**, and **Redis**.

Featuring real-time financial tracking, INR (₹) primary currency support, student income & allowance tracking, student category budgets, a dynamic "Daily Safe-to-Spend" calculator, interactive Recharts analytics, student savings goals with progress tracking, hostel/project group bill splitting, smart student insight alerts, and campus-tailored expense exports.

---

## 🎓 Academic Project Overview

- **Project Name**: expensetracker
- **Project Title**: Smart Student Expense Tracker and Budget Management System
- **Application Branding**: `expensetracker`
- **Dashboard Greeting**: `Welcome back, Sowmya`
- **Tagline**: *Spend wisely. Save confidently.*
- **Subtitle**: *Smart Student Finance — Spend wisely. Save confidently.*
- **Target Audience**: College & University Students, Hostel Residents, Student Project Groups

### Abstract
College students often struggle with managing limited monthly allowances, tracking variable campus expenditures (canteen, photocopy/xerox, transport, semester books), and splitting shared hostel or project bills with peers. Traditional expense trackers are generic, default to foreign currencies (USD/GBP), and lack student-relevant categories, income/allowance tracking, savings goals, or daily pacing guidance. 

**expensetracker** solves this problem by delivering a tailored, responsive financial companion for college life. It features Indian Rupee (₹) financial calculations, campus-optimized spending categories, intelligent daily safe-to-spend guidance to prevent end-of-month fund exhaustion, allowance and scholarship income tracking, savings goals (for laptops, tuition, and emergency funds), automated AI categorization for student terminology, and collaborative group expense splitting for roommates and project teams.

---

## 🌟 Key Features

### 1. Student Dashboard & Pacing Guidance
- **Personalized Greeting**: "Welcome back, Sowmya" with real-time academic date display.
- **Daily Safe-to-Spend Metric**: Dynamically calculates `(Available Balance / Days Remaining in Month)` to prevent overspending before pocket money or allowances replenish.
- **KPI Metrics Cards**: Total Expenses, Total Income, Month-over-Month comparison, Category Budget Utilization, Available Balance, and Savings Rate.
- **One-Click Quick Log Shortcuts**: Fast campus expense logging for high-frequency student purchases (Canteen Dosa & Chai, Metro Ticket, Xerox/Stationery, Hostel Mess) plus Income and Goal creation.
- **Interactive Visualizations**: 30-day interactive area trends and category breakdown donut charts using Recharts with INR axes.

### 2. Income & Allowance Tracking
- Track student income sources: Monthly Allowance from parents, Merit Scholarship, Part-Time Tutoring/Jobs, Research Stipends, Freelancing, and Cash Gifts.
- Dynamic balance calculation: `Total Income - Total Expenses = Available Balance`.
- Savings rate calculation: `(Net Savings / Total Income) * 100%`.

### 3. Student Savings Goals
- Set and track student targets: e.g., Semester Tuition Fund, High-Performance Coding Laptop, Hostel Contingency / Emergency Fund.
- Progress bars and quick one-click contributions from available campus savings.

### 4. Tailored Student Categories
All spending classifications are mapped with student-specific labels, icons, and descriptions:
- 🍽️ **Canteen, Mess & Food**: Campus canteen, mess bills, coffee, tiffin, Swiggy/Zomato.
- 🚌 **Bus, Metro & Commute**: Student bus passes, metro cards, autos, Rapido, scooty fuel.
- 🏠 **Hostel & PG Rent**: Room rent, maintenance, deposit, warden charges.
- ⚡ **Wi-Fi, Mobile & Recharge**: Jio/Airtel phone recharges, hostel Wi-Fi, electricity share.
- 🎬 **Outings & Hangouts**: Movies, weekend campus trips, birthday treats, hangouts.
- 💊 **Health & Wellness**: College infirmary, pharmacy, gym, first aid.
- 🛍️ **Personal & Supplies**: Toiletries, clothing, grooming, room essentials.
- 📚 **Tuition, Books & Xerox**: Semester fees, textbooks, notes printing, exam fees, stationery.
- ✈️ **Vacation & Home Travel**: Train tickets to home, festival journeys, road trips.
- 🎵 **OTT & Study Tools**: Coursera, Spotify Student, ChatGPT, Netflix, Prime.
- 📦 **General & Campus Misc**: Student club fees, festival celebrations, unexpected costs.

### 5. Student Group Bill Splits
- **Roommate & Group Expenses**: Create groups for "Hostel Roommates", "Project Teams", or "College Trips".
- **Settlement Tracking**: Computes simplified debt settlements with balance summaries so students know exactly who owes whom.
- **Equal & Custom Splits**: Support for equal splitting or custom amount assignments.

### 6. Campus AI Categorisation
- Enhanced keyword matching recognizes Indian college terms (`mess`, `canteen`, `samosa`, `chai`, `rapido`, `pg`, `xerox`, `recharge`, `sem fee`, `textbooks`).
- Optional Anthropic Claude receipt scanning for automatic paper bill extraction.

### 7. Multi-Currency Support with INR Default
- Indian Rupee (`₹`, `INR`) configured as base currency with standard Indian number formatting (`₹1,500.00`).
- Real-time exchange rate engine with fallback tables for foreign currency conversion (USD, EUR, GBP, AUD, CAD, etc.).

### 8. Reports & Audit Trails
- **Branded PDF Export**: Generates professional, server-side PDF expense statements branded for *expensetracker — Smart Student Financial Records*.
- **CSV Data Export / Import**: Bulk import campus transactions via CSV with validation and downloadable student templates with Type and Notes columns.
- **Audit Activity Feed**: Track budget edits, group settlements, and expense additions.

---

## 🛠️ System Architecture & Tech Stack

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React 18 + TS)                  │
│       Vite • Tailwind CSS • React Router 6 • Recharts       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST / GraphQL
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server (Node.js + Express)                │
│    Apollo GraphQL 4 • JWT Auth • Rate Limiting • Helmet     │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MongoDB Database        │ │        Redis Cache         │
│ Mongoose ODM • Index Engine  │ │  Exchange Rates & Sessions │
└──────────────────────────────┘ └────────────────────────────┘
```

### Technology Matrix
| Layer | Technologies |
|---|---|
| **Frontend** | React 18.2, TypeScript 5.3, Vite, Tailwind CSS 3.4, Lucide Icons, Recharts, Vitest |
| **Backend API** | Node.js 20+, Express.js 4.18, Apollo GraphQL Server 4, Supertest, Jest |
| **Database** | MongoDB 7.0 (with compound indexes on `{user, date}` & `{user, category, date}`) |
| **Cache & Performance** | Redis 7.0 for currency exchange rate caching |
| **Authentication** | JSON Web Tokens (JWT) with bcrypt password hashing |
| **Document Generation** | PDFKit for server-side expense report generation |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: v6.0 or v7.0 running locally on port `27017` (or MongoDB Atlas URI)
- **Redis** (optional): running locally on port `6379` (fallback in-memory mode active if Redis is offline)

### 1. Clone & Setup Project
```bash
cd sowmyya
```

### 2. Backend Configuration & Dependencies
```bash
cd server
npm install
```

Create or verify `server/.env`:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/expense-tracker
JWT_SECRET=sowmyya_student_expense_tracker_secret_dev_key_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Seed Realistic Student Demo Data
Populate the database with sample student expenses, budgets, recurring bills, and hostel groups:
```bash
npm run seed
```

**Pre-seeded Demo Student Account:**
- **Email**: `demo@expense.app`
- **Password**: `demo123`
- **Student Profile**: Sowmyya (B.Tech Final Year, ₹15,000 monthly allowance)

### 4. Frontend Setup
```bash
cd ../client
npm install
```

### 5. Running the Application

**Option A — Run Both Servers Concurrently (from root):**
```bash
npm run dev
```

**Option B — Run Separately:**
- Backend terminal:
  ```bash
  cd server && npm start
  # Express runs on http://localhost:5001
  # GraphQL Sandbox: http://localhost:5001/graphql
  ```
- Frontend terminal:
  ```bash
  cd client && npm run dev
  # Client runs on http://localhost:5173
  ```

---

## 🧪 Testing & Verification

Both the backend and frontend include automated test suites.

### Frontend Unit & Component Tests (Vitest)
```bash
cd client
npm test
```
- **Tests**: 28 passing tests covering currency formatting, student categories, summary cards, and expense modals.

### Frontend Production Build
```bash
cd client
npm run build
```
- Compiles TypeScript and creates optimized Vite production bundle in `client/dist/`.

### Backend API Tests (Jest)
```bash
cd server
npm test
```
- **Tests**: 9 passing integration tests covering user registration, validation, JWT issuance, and authentication routes.

---

## 📁 Project Structure

```
sowmyya/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI (Sidebar, Layout, Charts, Modals)
│   │   ├── context/            # Global Auth & Theme Context
│   │   ├── hooks/              # Custom Data Fetching Hooks (useData)
│   │   ├── pages/              # Pages: Dashboard, Expenses, Analytics, Groups, etc.
│   │   ├── test/               # Vitest component & formatting tests
│   │   ├── utils/              # INR currency formatters, API client, helpers
│   │   └── types/              # TypeScript interfaces & types
│   ├── index.html              # Sowmyya Application Entry
│   └── package.json
│
├── server/                     # Backend API & Server
│   ├── graphql/                # Apollo GraphQL schemas & resolvers
│   ├── middleware/             # JWT auth & Redis cache middleware
│   ├── models/                 # Mongoose models (User, Expense, Budget, Group, etc.)
│   ├── routes/                 # REST endpoints (auth, expenses, analytics, groups)
│   ├── utils/                  # Student seed script, AI categorizer, PDF generator
│   ├── test/                   # Jest API route integration tests
│   ├── index.js                # Express & Apollo server entrypoint
│   └── package.json
│
├── LICENSE                     # MIT License & Attribution
└── README.md                   # Project Documentation
```

---

## 📜 Attribution & Academic Integrity Notice

This project was developed for a college degree academic evaluation by building upon and adapting the open-source **ExpenseFlow** project by **Anuhya Parlapalli** under the terms of the **MIT License**.

### Foundation Repository
- **Original Project**: ExpenseFlow
- **Original Author**: Anuhya Parlapalli
- **Original Repository**: [https://github.com/Anuhya3/expense-tracker](https://github.com/Anuhya3/expense-tracker)
- **License**: MIT License (Preserved in full in `LICENSE`)

### College Project Adaptations & Enhancements
1. **Rebranding & Visual Identity**: Fully transitioned branding to **expensetracker — Smart Student Expense Tracker & Budget Management System** with academic styling, graduation cap iconography, deep forest-green theme, and personalized greeting `Welcome back, Sowmya`.
2. **Indian Currency Architecture**: Refactored the core system default from GBP (`£`) to INR (`₹`), integrating `en-IN` numbering, Indian Rupee exchange rate base tables, and INR PDF formatting.
3. **Student Spending Model**: Re-architected expense categories and Mongoose seed data around authentic college lifestyles (campus canteen, mess, bus/metro transit, room rent, mobile recharges, xerox/notes printing, and semester books).
4. **Income & Allowance Tracking**: Implemented income tracking (`allowance`, `scholarship`, `part_time`, `stipend`, `freelance`, `gift`, `other_income`) with dynamic balance and savings rate calculations.
5. **Student Savings Goals**: Added target-based savings goals (Tuition, Laptop, Emergency fund) with real-time progress indicators and contribution actions.
6. **Daily Safe-to-Spend Metric**: Implemented a dynamic daily spending allowance widget on the student dashboard that factors in remaining days of the month to prevent end-of-month student debt.
7. **Campus AI Categorizer**: Augmented keyword matching with Indian student vernacular (`samosa`, `chai`, `rapido`, `pg`, `xerox`, `recharge`, `sem fee`).
8. **Student Group Workflows**: Tailored group split configurations for hostel room sharing and final-year project teams.
9. **Production & Test Hardening**: Resolved test race conditions in Express server listeners, updated test mock assertions, and validated 100% test pass rates across both frontend (28/28) and backend (9/9) suites.
