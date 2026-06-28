# apartment-tracker — Development Guidelines

## Monorepo Structure

```
apps/
  interface/      # Next.js frontend
  main-service/   # NestJS backend
```

---

## Backend (NestJS — `apps/main-service`)

### Module Organisation
- Group related code into feature modules (e.g. `database/`, `apartments/`). Each module has its own `*.module.ts`, `*.provider.ts` or `*.service.ts`, and `*.controller.ts` as needed.
- Register every provider and module explicitly — no implicit global providers except `ConfigModule` (which is set `isGlobal: true`).

### Configuration
- All environment variables are declared in `apps/main-service/.env` and read exclusively through `ConfigService` (from `@nestjs/config`).
- The config factory lives in `src/config.ts` and maps env vars to typed, namespaced keys (e.g. `db.host`).
- Never access `process.env` directly outside of `config.ts`.
- `.env` is gitignored. Provide a `.env.example` when adding new variables.

### Database
- The Postgres connection is a `pg.Pool` provided under the `DATABASE_POOL` injection token (`src/database/database.provider.ts`).
- Inject the pool with `@Inject(DATABASE_POOL)` wherever raw queries are needed.
- The provider runs `SELECT 1` on startup to fail fast if the DB is unreachable.
- Connection parameters: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` — all sourced from `.env`.

### Entities
- All database entities must extend `BaseEntity` (`src/database/base.entity.ts`), which provides `id` (UUID), `created` (timestamptz), and `modified` (timestamptz).
- Never redefine `id`, `created`, or `modified` on a subclass — inherit them from `BaseEntity`.
- Each entity lives in its own feature folder (e.g. `src/bills/bill.entity.ts`).
- Every entity must have a matching TypeScript interface in `packages/types` (e.g. `packages/types/src/bill.ts`) and be re-exported from `packages/types/src/index.ts`.
- The entity class must `implement` its shared interface (e.g. `class BillEntity extends BaseEntity implements Bill`) so the compiler enforces they stay in sync.
- The shared interface is the contract used by the frontend to type API responses — never import entity classes into the frontend.
- Any change to an entity (adding, removing, or renaming a field) must be reflected in its shared interface in `packages/types` and accompanied by a new migration SQL file in `src/migrations/`. All three — entity, type, and migration — must be updated together in the same commit.

### General
- Use NestJS dependency injection throughout; avoid manual instantiation of services or providers.
- Keep controllers thin — business logic belongs in services.
- Validate incoming request shapes at the boundary (DTOs with class-validator when added).

---

## Frontend (Next.js — `apps/interface`)

### Component Library
- **Ant Design v6** is the primary UI component library. Prefer Ant Design components over building primitives from scratch.
- Wrap or extend Ant Design components when custom behaviour is needed rather than reimplementing them.
- The Ant Design theme is configured in `src/components/ThemeProvider.tsx` — add token overrides there, not inline.

### Component Organisation
- All shared components live in `src/components/`. A component used in more than one page must be extracted here.
- Page-level components (used only in one route) may live alongside their page file, but move them to `src/components/` the moment they are reused.
- Each component file exports a single default or named component matching the filename.

### Colors
- **No hardcoded color values anywhere in the codebase.**
- CSS colors are defined as custom properties in `src/globals.css` under `:root` and referenced as `var(--color-*)`.
- TypeScript/JS colors are exported from `src/globals.tsx` as the `colors` constant and imported where needed.
- Both files must stay in sync — when adding a new color, add it to both.
- Ant Design semantic tokens (e.g. `colorPrimary`) are set via the theme in `ThemeProvider.tsx`, not hardcoded.

### Date Handling
- Use **dayjs** for all date formatting, parsing, and arithmetic — never use `new Date()` or manual date string manipulation in the frontend.
- The standard display format across the app is `DD/MM/YY`.

### Data Flow
Every entity follows this pattern — no direct `fetch` calls in components.

```
useEffect (component mount)
  → store action (e.g. fetchByType)     src/store/*Store.ts
    → API module function               src/api/*Api.ts
      → fetch to backend
    ← response
  ← store updates state
← component re-renders from store
```

For each new entity:
1. **API module** (`src/api/<entity>Api.ts`) — exports a plain object with methods (`fetchBy*`, `create`, `update`, `delete`). All HTTP calls go through a shared `request<T>` wrapper that reads `NEXT_PUBLIC_API_URL`. Never call `fetch` directly in a component or store.
2. **Zustand store** (`src/store/<entity>Store.ts`) — owns all state for that entity (data keyed by a relevant discriminator, loading flags). Actions call the API module, then `set` the new state. The component never touches the API module directly.
3. **Component** — calls the store action inside a `useEffect` on mount (scoped to the relevant key). Reads data and loading state from the store. Has no knowledge of the API layer.

### Styling
- Use CSS Modules (`*.module.css`) for component-scoped styles.
- Global styles go in `src/globals.css` only.
- Do not use inline `style` props for anything other than truly dynamic values that cannot be expressed as a CSS variable or class.
