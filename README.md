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
A dedicated **Usage** page provides deep insight into Electric, Water, and Gas consumption:

- **CSV import** — drag-and-drop a meter export file to bulk-load readings; duplicate entries are silently skipped and the confirmation reports only the number of rows actually saved
- **Smart date range** — on load the view defaults to the last 7 days; the range picker is pre-populated and restricts selectable dates to the span covered by your data (no empty queries)
- **Quick presets** — one-click shortcuts for Today, Yesterday, Last 7 Days, Last Week, Last 30 Days, and Last Month, each automatically clamped to your data bounds
- **Granularity toggle** — switch between raw readings (All), daily totals (Day), and weekly totals (Week)
- **Single mode** — area chart for a single date range with Total, Day-hours, and Night-hours statistics
- **Compare mode** — overlay up to five date ranges on a cascade area chart; the X axis is normalised to Day N / Week N so ranges of any absolute dates can be meaningfully compared; per-range statistics are shown below the chart

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

## Running with Docker (recommended)

The easiest way to run the app locally. Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) and an existing PostgreSQL instance with the `apartment_tracker` database and migrations already applied.

### Prerequisites

- Docker Desktop running
- PostgreSQL accessible on `localhost:5432` with the following credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_NAME=apartment_tracker
```

If your credentials differ, update the `environment` block under `main-service` in `docker-compose.yml` before building.

### First run

Build the images and start the containers:

```bash
docker compose up --build -d
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Day-to-day usage

```bash
# Start
docker compose start

# Stop (containers and data persist)
docker compose stop

# Check status
docker compose ps

# View logs
docker compose logs -f
```

Use `start` / `stop` for daily on/off — they preserve container state. Only re-run `up --build` when you pull new code and need to rebuild the images.

---

## Installation

### Prerequisites

- **Node.js** 18 or later
- **pnpm** 8 or later (`npm install -g pnpm`)
- **PostgreSQL** 14 or later (running and accessible)

---

### 1. Clone the repository

```bash
git clone git@github.com:barmargalit/apartment-tracker.git
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
```

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
