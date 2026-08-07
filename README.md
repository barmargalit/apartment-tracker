# Apartment Tracker

A personal home management app for tracking household bills, monitoring utility usage, evaluating apartment purchase prospects, and planning mortgage financing.

---

## Features

### Bill Tracking
Track recurring and one-off household expenses across six bill types:

| Type | Extra data captured |
|---|---|
| Electric | Usage (kWh), billing period, year |
| Water | Usage (m³), billing period, year |
| Internet | — |
| Gas | — |
| Property Tax | Year |
| Building Fee | — |

- Attach a **provider** and **residence** to each bill
- Add free-text **comments** per bill
- Electric and Water bills display a **usage-over-time chart** on the bills page

### Home Dashboard
The home page shows:
- **Last Bills** — the most recent bill for each active type at a glance
- **Bills Breakdown** — a donut chart of total spending split by bill type

### Usage Statistics
The Bills page includes a per-type **usage chart** for Electric and Water bills, letting you spot consumption trends over time across billing periods.

### Providers
Manage the utility companies behind your bills. Each provider has a name and an associated bill type, and can be linked to individual bill records.

### Residence Management
Track your current and past residences. Bills can be scoped to a specific residence, making it easy to compare costs across homes.

### Prospects Tracking
Keep a shortlist of apartments you are evaluating for purchase. Each prospect records:

- Street and city
- Size (m²) and balcony size
- Number of rooms
- Parking (yes/no)
- Safe space / shelter type — Room, Floor, Building, or None
- Contractor (for new-build apartments)
- Free-text notes

Full create, edit, and delete support with a clean table view.

### Mortgage Calculator
Model a mortgage before committing. Supports multiple **plans**, each composed of multiple **tracks** (loan tranches) — matching the way Israeli banks structure mortgages.

**Track types:**

| Type | Parameters |
|---|---|
| Fixed Unlinked | Annual interest rate |
| Fixed Index-Linked | Annual rate + annual CPI |
| Variable Index-Linked | Annual rate + annual CPI |
| Prime | Bank of Israel prime rate + spread |
| Foreign Currency | Annual rate + expected annual FX change |

For each plan you get:
- Month-by-month **amortization table** (balance, scheduled payment, principal, interest)
- **Track summary** with first-payment breakdown and effective rates
- Plans are saved to the database and can be revisited at any time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Ant Design v6, Zustand, dayjs |
| Backend | NestJS 10, PostgreSQL (`pg`), raw SQL |
| Shared types | TypeScript package (`@apartment-tracker/types`) |
| Package manager | pnpm (workspace monorepo) |

---

## Project Structure

```
apartment-tracker/
├── apps/
│   ├── interface/        # Next.js frontend  (port 3000)
│   └── main-service/     # NestJS backend     (port 3001)
└── packages/
    └── types/            # Shared TypeScript interfaces
```

---

## Installation

### Prerequisites

- **Node.js** 18 or later
- **pnpm** 8 or later (`npm install -g pnpm`)
- **PostgreSQL** 14 or later (running and accessible)

---

### 1. Clone the repository

```bash
git clone <repo-url>
cd apartment-tracker
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure the backend

Create `apps/main-service/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=apartment_tracker
```

### 4. Configure the frontend

Copy the example env file:

```bash
cp apps/interface/.env.example apps/interface/.env.local
```

The default `apps/interface/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_ENABLED=false
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Set `NEXT_PUBLIC_GOOGLE_MAPS_ENABLED=true` and provide an API key to enable address autocomplete on the Prospects page.

### 5. Set up the database

Create the database in PostgreSQL:

```bash
createdb apartment_tracker
```

Then apply the migrations in order. From the repo root:

```bash
for f in apps/main-service/src/migrations/*.sql; do
  psql -U your_db_user -d apartment_tracker -f "$f"
done
```

Or apply them one by one using your preferred PostgreSQL client. The migration files are sequential — they must be run in order (001 → 018).

### 6. Build the shared types package

```bash
pnpm --filter @apartment-tracker/types build
```

### 7. Start the development servers

Run all services in parallel from the repo root:

```bash
pnpm dev
```

Or start them individually:

```bash
# Backend
pnpm --filter main-service dev

# Frontend (in a separate terminal)
pnpm --filter interface dev
```

The app is now available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

Run from the repo root:

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all apps and packages |

---

## Environment Variables Reference

### Backend (`apps/main-service/.env`)

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | — | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | — | PostgreSQL user |
| `DB_PASSWORD` | — | PostgreSQL password |
| `DB_NAME` | — | Database name |

### Frontend (`apps/interface/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_ENABLED` | `false` | Enable Google Maps address autocomplete |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | — | Google Maps API key (required if enabled) |
