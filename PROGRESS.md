# Progress

See `PLAN.md` for the full plan and build order.

- [x] Phase A — Package scaffold
- [x] Phase B — Theme tokens
- [x] Phase C — API client core
- [~] Phase D — Resource modules (auth + admin done; the rest land alongside
      whichever app needs them first)
- [~] Phase E — Shared components (StatusPill, StatCard, Panel, buttons,
      DataTable shell done; Toggle not yet needed by any built screen)

## Log

- 2026-08-20 — Wrote `PLAN.md` alongside the plans for `q-wash-admin`,
  `q-wash-cabinet`, `q-wash-worker`, `q-wash-display`, and the backend
  changes plan `q-wash-api/docs/PLAN_WEB_APPS.md`. Nothing built yet.
- 2026-08-20 — Built to support `q-wash-admin`'s Мойки screen (its first
  real screen — see its own `PROGRESS.md`). Package consumed as raw TS
  source via a `file:` dependency (no build step), per Phase A's "decide
  once the first app tries to import it" — Vite's transpile-on-the-fly
  works fine, confirmed by a real `npm install` + `tsc -b && vite build`
  from `q-wash-admin` (Node/npm are on this machine via `nvm`, just not on
  the default `PATH` — `~/.nvm/versions/node/v24.18.1/bin`).
  - `theme/`: colors/font/radius tokens lifted from the mock's inline
    styles; `Manrope-Variable.ttf`/`Prata-Regular.ttf` copied from
    `q-wash/assets/fonts` (reused, not re-downloaded) with a `fonts.css`
    `@font-face` sheet, consuming apps import it directly
    (`q-wash-shared/theme/fonts.css`) instead of the mock's Google Fonts
    CDN links.
  - `api/`: `client.ts` (bearer attach, single coalesced refresh-token
    exchange on 401, Russian error-code map), `auth.ts`
    (`loginWithPassword`/`logout`/`getMe`), `admin.ts`
    (`listAdminWashingPoints`/`getAdminStats`) — the two admin-only
    endpoints `q-wash-admin`'s Мойки screen needed.
    `WashingPointCreate` is typed (matches `openapi.yaml`) but has no
    caller yet — the new-point wizard doesn't submit yet, see
    `q-wash-admin/PROGRESS.md`.
  - `auth/`: `tokenStorage` (localStorage) + a small framework-agnostic
    `authStore` (pub/sub, `useAuth()` via `useSyncExternalStore`) —
    `restore()`/`login()`/`logout()` as planned.
  - `components/`: `StatusPill`, `StatCard`, `Panel`, `PrimaryButton`/
    `GhostButton`/`DangerButton`, `DataTable`/`DataTableHeaderRow`/
    `DataTableRow` — built against the mock's literal inline styles, as
    plain inline-style React components (no CSS-in-JS, per plan). `Toggle`
    intentionally not built yet — no built screen uses it (it's a
    staff/cabinet-app control); add it when `q-wash-cabinet` needs it.
  - Found and fixed one real bug during manual testing: `api/client.ts`'s
    error-body parsing did `errorBody?.error.code` (only the first `?.`
    was optional) — a non-JSON or unexpected-shape error body would throw
    `Cannot read properties of undefined` instead of falling back cleanly.
    Fixed to `errorBody?.error?.code` (and the `.message` read next to it).
  - Versions pinned to whatever `npm create vite@latest --template
    react-ts` itself scaffolds today (React 19.2, Vite 8.2, TypeScript
    ~6.0.2, `@tanstack/react-query` 5.101, `react-router-dom` 7.18) rather
    than hand-picked latests, to stay on a combination the tooling itself
    vouches for.
