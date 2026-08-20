# q-wash-shared — Plan

Not an app — a package the other four (`q-wash-admin`, `q-wash-cabinet`,
`q-wash-worker`, `q-wash-display`) depend on, so `q-wash-api` integration,
auth, and the visual design language are written once instead of four
times. Each app pulls it in as `"q-wash-shared": "file:../q-wash-shared"`
in `package.json` — a plain npm local-path dependency (npm symlinks it into
`node_modules` on install), not a formal npm/pnpm/yarn workspace. That
keeps every app a genuinely separate top-level directory/repo, per the
user's explicit ask, while still sharing code — a real workspace would want
all five nested under one root, which they deliberately aren't.

## What's in it

```
q-wash-shared/
  PLAN.md
  package.json
  tsconfig.json
  src/
    theme/            design tokens lifted from the mock's inline styles —
                       colors, type scale, radii — plus the Prata/Manrope
                       font setup, matching q-wash (mobile)'s theme 1:1
    api/               a typed fetch client for q-wash-api: base client
                        (bearer-token attach, 401 -> single shared
                        refresh-token exchange, same coalescing pattern
                        q-wash's dio interceptor uses), one module per
                        resource (washingPoints, owners, services, boxes,
                        queue, connectionRequests, auth), generated/
                        hand-written types matching docs/openapi.yaml
    auth/               token storage (localStorage export, worker apps run
                        on shared/kiosk devices so no more-secure browser
                        storage is available anyway) + a small
                        auth-state store (login, logout, restore-on-load,
                        role check) — framework-agnostic, each app wires it
                        into its own router's redirect logic
    sse/                a small EventSource wrapper for the endpoints that
                        stream (customer queue SSE exists already; the
                        display board's SSE variant per
                        q-wash-api/docs/PLAN_WEB_APPS.md would use this
                        too, once built)
    components/         the handful of primitives every screen in the mock
                        reuses: StatusPill (ok/warn/bad/mute), Toggle
                        switch, PrimaryButton/GhostButton/DangerButton,
                        StatCard, DataTable shell — built once against the
                        mock's exact inline styles, not a general-purpose
                        component library
```

## Decisions

- **Distribution**: `file:` dependency, not a workspace and not published
  to a registry. Simplest thing that lets 4 separate app directories share
  code without a monorepo restructure.
- **No framework opinion beyond React**: ships plain TS + React components,
  no CSS-in-JS library, no state-management library — matches the "Vite +
  React + TypeScript" choice for all four apps; each app's own `PLAN.md`
  covers its app-specific state/routing choices.
- **Theme is one fixed dark palette**: the mock has no light mode, same as
  q-wash (mobile)'s theme decision — tokens are hardcoded values, not a
  theme-switching system.
- **API types**: hand-written to match `q-wash-api/docs/openapi.yaml`
  rather than codegen — the spec is small enough that a generator adds
  more friction (extra build step, generated-file review noise) than it
  saves; revisit if the surface grows a lot across the backend phases in
  `q-wash-api/docs/PLAN_WEB_APPS.md`.
- **Depends on backend phases landing incrementally**: the `api/` client
  modules for owners/boxes/schedule/photos/connection-requests/worker
  pause-resume/public-board don't exist yet because the endpoints don't
  exist yet (see `q-wash-api/docs/PLAN_WEB_APPS.md`) — built alongside
  each backend phase, not all up front against a spec that hasn't shipped.

## Build order

- [ ] **A — Package scaffold**: `npm create vite` (react-ts template, but
      built as a library — no `index.html` app shell needed here), `tsc`
      build config that emits declarations, `package.json` with a `build`
      script the four apps' own build can depend on (or just consume the
      TS source directly via Vite's transpile-on-the-fly, skipping a
      separate build step entirely — decide once the first app tries to
      import it; simplest option first).
- [ ] **B — Theme tokens**: colors/type/radii extracted from `Car Wash Web
      Apps.dc.html`'s inline styles, Prata + Manrope font files (reuse the
      same TTFs already bundled in `q-wash/assets/fonts` rather than
      re-downloading).
- [ ] **C — API client core**: base fetch wrapper, token-refresh
      interceptor logic, error typing matching `q-wash-api`'s error-code
      envelope (same one `q-wash` (mobile)'s `api_exception.dart` maps to
      Russian strings — this package should probably own that Russian
      error-code map too, so all four web apps get it for free instead of
      reimplementing it).
- [ ] **D — Resource modules**: one per existing endpoint group first
      (washingPoints, services, queue, auth/login) since those exist in
      `q-wash-api` today; new ones added as each backend phase in
      `q-wash-api/docs/PLAN_WEB_APPS.md` ships.
- [ ] **E — Shared components**: StatusPill, Toggle, buttons, StatCard,
      DataTable shell, built against the mock's literal inline styles.

Progress logged in `PROGRESS.md` as work happens.
