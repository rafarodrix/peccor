# Peccor — Developer Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Database Schema](#database-schema)
6. [Authentication & Sessions](#authentication--sessions)
7. [Multitenancy](#multitenancy)
8. [RBAC — Roles & Permissions](#rbac--roles--permissions)
9. [Server Actions Pattern](#server-actions-pattern)
10. [Server Queries Pattern](#server-queries-pattern)
11. [Form Validation](#form-validation)
12. [Business Logic Utilities](#business-logic-utilities)
13. [Charts](#charts)
14. [CSV Export & PDF Reports](#csv-export--pdf-reports)
15. [Alerts System](#alerts-system)
16. [Onboarding](#onboarding)
17. [Testing](#testing)
18. [Styling](#styling)
19. [Key Conventions & Gotchas](#key-conventions--gotchas)

---

## Overview

Peccor is a multitenant SaaS cattle farm management platform. It manages the full livestock cycle: purchase → lot management → weighings → health events → sale, with financial tracking and zootechnical analytics throughout.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| ORM | Prisma | 7.x |
| Database | PostgreSQL | — |
| Auth | NextAuth | 5.0.0-beta.31 |
| Styling | Tailwind CSS | 4.x (CSS-config, no `tailwind.config.ts`) |
| Forms | React Hook Form + Zod | 7.x + 4.x |
| Charts | Recharts | 3.x |
| UI Components | Radix UI primitives | — |
| Testing | Vitest + Testing Library | 4.x + 16.x |
| Test Env | happy-dom | 20.x |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                  # Authenticated app shell
│   │   ├── layout.tsx          # App layout with Sidebar + Header
│   │   ├── dashboard/          # Dashboard with real DB stats
│   │   ├── fazendas/           # Farm list + [id] detail
│   │   ├── areas/              # Farm areas CRUD
│   │   ├── lotes/              # Lot list + [id] detail (with projections)
│   │   ├── rebanho/            # Animal list + [id] detail (with charts)
│   │   ├── pesagens/           # Weighing registration
│   │   ├── compras/            # Purchase registration
│   │   ├── vendas/             # Sale registration
│   │   ├── custos/             # Cost management
│   │   ├── manejo-sanitario/   # Health events
│   │   ├── financeiro/         # Financial overview
│   │   ├── relatorios/         # Reports + PDF print view
│   │   ├── importar/           # CSV import
│   │   └── configuracoes/      # Settings, users, access profiles
│   ├── (auth)/                 # Public auth pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth handler
│       └── relatorios/         # CSV download endpoints
│           ├── animais/
│           ├── custos/
│           └── pesagens/
├── components/
│   ├── ui/                     # Radix-based primitives (Button, Input, etc.)
│   ├── forms/                  # Reusable form components per entity
│   ├── charts/                 # WeightChart, GmdChart (Recharts, "use client")
│   ├── layout/                 # Sidebar, Header, AlertsBell
│   ├── lots/                   # LotProjectionCard
│   ├── dashboard/              # StatCard, RecentLotsTable
│   └── onboarding/             # OnboardingBanner
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── permissions.ts          # RBAC permission matrix + helpers
│   ├── projections.ts          # calcLotProjection()
│   ├── utils.ts                # kg↔arrobas, GMD, slugify, financial calcs
│   ├── export.ts               # CSV/PDF export helpers
│   ├── prisma.ts               # Singleton Prisma client
│   ├── validations/            # Zod schemas per entity
│   └── __tests__/              # Unit tests
├── server/
│   ├── actions/                # Server Actions (mutations)
│   ├── queries/                # Server-side DB reads
│   └── services/
│       └── tenant.ts           # requireTenant() / requirePermission()
├── test/
│   └── setup.ts                # @testing-library/jest-dom setup
└── types/
    └── index.ts                # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- `.env` with `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`

### Setup

```bash
npm install
npx prisma migrate dev
npx prisma db seed        # optional seed data
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/peccor"
AUTH_SECRET="random-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

> **Prisma v7 note**: The datasource in `schema.prisma` has **no `url` field**. The URL is configured in `prisma.config.ts`. Do not add `url = env("DATABASE_URL")` to the schema.

---

## Database Schema

### Hierarchy

```
Tenant
  └── Farm
        └── FarmArea
        └── CattleLot
              └── Animal
                    └── Weighing
                    └── HealthEvent
                    └── AnimalMovement
              └── Weighing (lot-level)
              └── Cost
        └── Purchase / Sale
        └── Cost (farm-level)
```

### Key Models

| Model | Purpose |
|---|---|
| `Tenant` | SaaS organization (has slug, contact, subscription) |
| `TenantUser` | Join table: User ↔ Tenant with `TenantRole` |
| `Farm` | A physical farm within a Tenant |
| `FarmArea` | Pasture/paddock within a Farm |
| `CattleLot` | Group of animals managed together |
| `Animal` | Individual animal with breed, sex, DOB, tag |
| `Weighing` | Weight record (lot or animal level) with computed GMD |
| `HealthEvent` | Vaccine, deworming, medication, disease, death |
| `Cost` | Fixed/variable expense with categories and payment status |
| `Purchase` | Cattle acquisition with freight, commission, etc. |
| `Sale` | Cattle sale with deductions and net value |
| `Subscription` | `FREE \| PRO \| ENTERPRISE` plan per Tenant |

### Enums

- `TenantRole`: `OWNER | ADMIN | MANAGER | FINANCE | VETERINARY | OPERATOR | VIEWER | MEMBER`
- `AnimalSex`: `MACHO | FEMEA`
- `LotStatus`: `ACTIVE | CLOSED | SOLD`
- `CostStatus`: `OPEN | PAID | CANCELED`
- `CostCategory`: 13 categories (RACAO, VACINA, FUNCIONARIO, etc.)
- `HealthEventType`: `VACINA | VERMIFUGO | MEDICAMENTO | DOENCA | MORTE | OUTRO`
- `SaaSPlan`: `FREE | PRO | ENTERPRISE`

---

## Authentication & Sessions

Auth is handled by **NextAuth v5 beta** with:

- **Credentials provider** — email/password with bcrypt hashing
- **Prisma adapter** — sessions stored in DB
- **JWT strategy** — session token in cookie

The session object includes `user.id`. All authenticated routes are protected by middleware at `src/middleware.ts` which checks for a valid session and redirects to `/login` if absent.

```ts
// lib/auth.ts — key pattern
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [Credentials({ ... })],
});
```

---

## Multitenancy

Every authenticated request resolves a `Tenant` + `TenantUser` via `requireTenant()`:

```ts
// src/server/services/tenant.ts
export async function requireTenant() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenantUser = await prisma.tenantUser.findFirst({
    where: { userId: session.user.id, active: true },
    include: { tenant: true },
  });
  if (!tenantUser) redirect("/login");

  return tenantUser; // has .tenant, .role, .userId, .tenantId
}
```

All DB queries **must** scope data to the tenant:

```ts
// Always filter through the tenant relationship
const lots = await prisma.cattleLot.findMany({
  where: { farm: { tenantId: tenantUser.tenant.id } },
});
```

---

## RBAC — Roles & Permissions

### Roles (hierarchy order)

| Role | Label | Typical Use |
|---|---|---|
| OWNER | Proprietário | Full access + subscription management |
| ADMIN | Administrador | Full access except subscription |
| MANAGER | Gerente | Day-to-day operations |
| FINANCE | Financeiro | Financial operations only |
| VETERINARY | Veterinário | Health + weighings only |
| OPERATOR | Operador | Field data entry |
| VIEWER | Visualizador | Read-only all data |
| MEMBER | Membro | Read-only basic data |

### Using Permissions in Server Actions

```ts
import { requirePermission } from "@/server/services/tenant";

export async function createAnimal(data: unknown) {
  const { error, tenantUser } = await requirePermission("animals:create");
  if (error || !tenantUser) return { error: error ?? "Não autorizado" };

  // tenantUser.tenant.id is available for scoping queries
}
```

### Checking Permissions in UI

```ts
import { hasPermission } from "@/lib/permissions";

// In a server component:
const canCreate = hasPermission(tenantUser.role, "animals:create");
```

### Full Permission List

See `src/lib/permissions.ts` for the complete `Permission` type and `ROLE_PERMISSIONS` matrix. There are 40+ permissions across 12 groups.

---

## Server Actions Pattern

All mutations go through Next.js Server Actions in `src/server/actions/`.

Standard pattern:

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/services/tenant";
import { prisma } from "@/lib/prisma";
import { MySchema } from "@/lib/validations/my-entity";

export async function createMyEntity(formData: FormData) {
  const { error, tenantUser } = await requirePermission("resource:create");
  if (error || !tenantUser) return { error: error ?? "Não autorizado" };

  const raw = Object.fromEntries(formData);
  const parsed = MySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }; // NOTE: .issues not .errors (Zod v4)
  }

  await prisma.myEntity.create({
    data: { ...parsed.data, tenantId: tenantUser.tenant.id },
  });

  revalidatePath("/my-entity");
  return { error: null };
}
```

> **Zod v4 breaking change**: Use `parsed.error.issues[0].message` — **not** `.errors[0].message`.

---

## Server Queries Pattern

Read-heavy operations live in `src/server/queries/` as plain async functions called from Server Components:

```ts
// src/server/queries/lots.ts
export async function getLots(tenantId: string) {
  return prisma.cattleLot.findMany({
    where: { farm: { tenantId } },
    include: { farm: true, _count: { select: { animals: true } } },
    orderBy: { createdAt: "desc" },
  });
}
```

Call from a Server Component page:

```ts
// In a page.tsx (async server component)
const tenantUser = await requireTenant();
const lots = await getLots(tenantUser.tenant.id);
```

---

## Form Validation

Schemas live in `src/lib/validations/`. Each uses Zod v4:

```ts
// Example: src/lib/validations/animal.ts
import { z } from "zod";

export const AnimalSchema = z.object({
  tag: z.string().min(1, "Identificação obrigatória"),
  breed: z.string().min(1, "Raça obrigatória"),
  sex: z.enum(["MACHO", "FEMEA"]),
  weight: z.coerce.number().positive("Peso deve ser positivo"),
  lotId: z.string().cuid().optional(),
});
```

Forms use React Hook Form + `@hookform/resolvers/zod`:

```ts
const form = useForm<z.infer<typeof AnimalSchema>>({
  resolver: zodResolver(AnimalSchema),
});
```

---

## Business Logic Utilities

All pure functions in `src/lib/utils.ts`:

| Function | Description |
|---|---|
| `kgToArrobas(kg)` | kg ÷ 15 |
| `arrobasToKg(ar)` | ar × 15 |
| `calcDailyGain(current, prev, days)` | GMD = (current - prev) / days |
| `calcCostPerHead(total, qty)` | total / qty |
| `calcCostPerArroba(cost, kg)` | cost / (kg/15) |
| `calcPurchaseTotalCost(animal, freight, commission, other)` | sum of all costs |
| `calcSaleNetValue(animal, freight, commission, discount)` | gross - deductions |
| `slugify(text)` | URL-safe slug with accent removal |

### Projections (`src/lib/projections.ts`)

```ts
calcLotProjection({
  currentAvgWeight,  // kg
  currentQuantity,   // head count
  avgDailyGain,      // kg/day
  targetWeight,      // kg (slaughter weight)
  pricePerArroba,    // R$/@ 
  totalCost,         // R$ (accumulated costs)
}): LotProjection
```

Returns: `daysToTarget`, `slaughterDate`, `projectedArrobas`, `projectedRevenue`, `projectedProfit`, `projectedProfitPerHead`, `projectedProfitPerArroba`.

---

## Charts

Charts are client components in `src/components/charts/`:

### WeightChart

Recharts `LineChart` showing weight evolution over time from `Weighing` records.

```tsx
<WeightChart
  data={weighings.map(w => ({
    date: format(w.date, "dd/MM"),
    weight: Number(w.weight),
  }))}
/>
```

### GmdChart

Recharts `BarChart` showing daily gain per weighing period. Bars are color-coded:
- Green: GMD ≥ 1.2 kg/day (excellent)
- Yellow: GMD ≥ 0.8 kg/day (acceptable)
- Red: GMD < 0.8 kg/day (poor)

Includes a `ReferenceLine` at the target GMD (default 1.2).

```tsx
<GmdChart
  data={weighings.map(w => ({
    date: format(w.date, "dd/MM"),
    gmd: Number(w.dailyGain ?? 0),
  }))}
  targetGmd={1.2}
/>
```

Both charts only render when `data.length >= 2`.

---

## CSV Export & PDF Reports

### CSV Export

API routes in `src/app/api/relatorios/`:

| Route | Data |
|---|---|
| `GET /api/relatorios/animais` | Animal list with lot, breed, weight |
| `GET /api/relatorios/custos` | Cost list with category, status, amount |
| `GET /api/relatorios/pesagens` | Weighing history with GMD |

All routes call `requireTenant()`, scope to tenant, and stream CSV with `Content-Disposition: attachment`.

Helper in `src/lib/export.ts`:

```ts
export function toCSV(headers: string[], rows: string[][]): string
export function formatDateCSV(date: Date): string
export function formatCurrencyCSV(value: number): string
```

### PDF Reports

Print pages at `/relatorios/[type]/print` — these are regular Next.js pages that render a print-optimized HTML layout. The browser's `window.print()` is triggered client-side. Supported types: `animais`, `custos`, `pesagens`.

The `/relatorios` main page has buttons to download CSV or open the print view.

---

## Alerts System

`src/server/queries/alerts.ts` generates typed alerts from DB state:

```ts
type Alert = {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  message: string;
  href?: string;
};

async function getAlerts(tenantId: string): Promise<Alert[]>
```

Alert rules:
- Animals with overdue weighings (> 30 days since last weighing)
- Lots near slaughter weight (within 10% of target)
- Unpaid costs past due date
- Lots with no weighings in the last 60 days

`AlertsBell` is a client component in `src/components/layout/alerts-bell.tsx` that renders a bell icon with a badge count. It receives alerts as props from the server layout.

---

## Onboarding

`OnboardingBanner` (`src/components/onboarding/onboarding-banner.tsx`) is displayed on the dashboard when a new tenant has not yet completed the setup checklist:

1. Create a Farm
2. Create a Lot
3. Register an Animal
4. Record a Weighing

The banner is hidden once all steps are complete. Detection happens server-side by checking counts for the tenant.

---

## Testing

### Running Tests

```bash
npm test                 # run once
npm run test:watch       # watch mode
npm run test:coverage    # with coverage report
```

### Test Files

```
src/lib/__tests__/
├── utils.test.ts        # unit tests for all utility functions
├── permissions.test.ts  # RBAC matrix tests for all 8 roles
└── projections.test.ts  # calcLotProjection edge cases
```

### Config

`vitest.config.ts` uses `happy-dom` environment and the `@` alias matching `tsconfig.json`. Global APIs (`describe`, `it`, `expect`) are enabled via `globals: true`.

Coverage is collected from `src/lib/**` only (pure functions — no Next.js/Prisma dependencies).

---

## Styling

Tailwind CSS v4 is configured **entirely via CSS** — there is no `tailwind.config.ts`.

Global styles live in `src/app/globals.css`. Design tokens (colors, radius, etc.) are defined as CSS custom properties there.

Component classes use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).

```ts
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />
```

---

## Key Conventions & Gotchas

### Prisma v7 — No `url` in schema

```prisma
// CORRECT
datasource db {
  provider = "postgresql"
}
// WRONG — do not add url field
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ← breaks Prisma v7
}
```

The URL is configured in `prisma.config.ts`.

### Zod v4 — `.issues` not `.errors`

```ts
// CORRECT
parsed.error.issues[0].message

// WRONG (Zod v3 syntax)
parsed.error.errors[0].message
```

### Next.js Server Components are async

All `page.tsx` files in `(app)/` are `async` server components. They call `await requireTenant()` at the top, then pass data as props to client components.

### Decimal fields from Prisma

Prisma returns `Decimal` objects for `@db.Decimal` columns. Always convert with `Number(value)` before arithmetic or passing to Recharts.

### Tenant scoping in queries

Never query without tenant scope. Always use:
```ts
where: { farm: { tenantId: tenant.id } }
// or directly:
where: { tenantId: tenant.id }
```

### revalidatePath after mutations

All server actions call `revalidatePath("/path")` after a successful mutation to invalidate the Next.js cache and trigger a re-render of the affected page.

### Form data coercion

HTML form submissions are always strings. Use `z.coerce.number()` for numeric fields and `z.coerce.date()` for date fields in Zod schemas.
