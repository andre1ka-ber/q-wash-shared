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
    sse/                `subscribeToBoardEvents`, added 2026-08-31 for
                        `q-wash-display`'s board stream
                        (`GET /washing-points/{id}/board/events`). Native
                        `EventSource` can't attach the `Authorization`
                        header every route needs, so this hand-rolls the
                        SSE protocol over `fetch()`'s `ReadableStream`
                        instead — not an `EventSource` wrapper. Only this
                        one endpoint is covered so far; no other web-app
                        screen consumes an SSE stream yet
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
- **Depended on backend phases landing incrementally**: the `api/` client
  modules for owners/boxes/schedule/photos/connection-requests/worker
  pause-resume/public-board were added alongside each backend phase in
  `q-wash-api/docs/PLAN_WEB_APPS.md` as it shipped, not all up front — as
  of 2026-09-02 every resource any of the four web apps needs exists in
  `src/api/`.

## Build order

All phases below are done — see `PROGRESS.md` for the full log.

- [x] **A — Package scaffold**: consumed as raw TS source via a `file:`
      dependency (no separate build step) — `package.json`'s
      `main`/`types`/`exports` point straight at `src/index.ts`, and
      Vite's transpile-on-the-fly in each consuming app handles the rest.
- [x] **B — Theme tokens**: colors/type/radii extracted from the mock's
      inline styles; Prata + Manrope TTFs reused from `q-wash/assets/fonts`.
- [x] **C — API client core**: base fetch wrapper, single coalesced
      token-refresh exchange on 401 with retry-once semantics, Russian
      error-code map (`api/errors.ts`).
- [x] **D — Resource modules**: one per `q-wash-api` resource group —
      washingPoints, owners, services, boxes, queue, schedule, photos,
      connectionRequests, admin, auth.
- [x] **E — Shared components**: StatusPill, Toggle, buttons, StatCard,
      Panel, DataTable.

Progress logged in `PROGRESS.md` as work happens.
