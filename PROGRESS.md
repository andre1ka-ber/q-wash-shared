# Progress

See `PLAN.md` for the full plan and build order.

- [x] Phase A — Package scaffold
- [x] Phase B — Theme tokens
- [x] Phase C — API client core
- [x] Phase D — Resource modules (auth, admin, owners, connection
      requests, queue (network board, per-point board, live-boxes,
      display board, status/pause/resume/cancel), washing-points,
      services, schedule, photos, boxes all done — every resource any of
      the four planned web apps needs so far has landed alongside the
      screen that first needed it)
- [x] Phase E — Shared components (StatusPill, StatCard, Panel, buttons,
      DataTable, Toggle)

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
- 2026-08-22 — Added `Owner`/`OwnerList`/`OwnerCreate`/`OwnerUpdate` types
  and `api/owners.ts` (`listOwners`/`createOwner`/`updateOwner`) for
  `q-wash-admin`'s new Owners screen (see its own `PROGRESS.md`). No
  `deleteOwner` — `openapi.yaml` has no `DELETE /owners/{id}`.
- 2026-08-22 (same session) — Added two more resource modules for
  `q-wash-admin`'s Connection requests and Bookings screens (see its own
  `PROGRESS.md` for the full story, including a real `GET /queue`
  attribution gap found and worked around client-side):
  - `ConnectionRequestStatus`/`ConnectionRequest`/`ConnectionRequestList`/
    `ConnectionRequestCreate`/`ConnectionRequestReview` types and
    `api/connectionRequests.ts`
    (`listConnectionRequests`/`createConnectionRequest`/
    `reviewConnectionRequest`).
  - `BoardItemStatus`/`BoardItem`/`BoardItemList`/`BookingStatus`/
    `Booking`/`BookingStatusUpdate` types and `api/queue.ts`
    (`listQueueNetworkWide`/`updateBookingStatus`). `Booking` is typed in
    full (matches `openapi.yaml`) even though only `id`/`status` are
    actually read right now — `updateBookingStatus`'s response is a full
    `Booking`, and the wizard (phase E) or a future booking-detail view
    will want the rest of the fields already being there.
- 2026-08-22 (later, same day) — Added `WashingPoint` (full response
  schema, matching `openapi.yaml`) and `api/washingPoints.ts`
  (`createWashingPoint`) — the `WashingPointCreate` type predicted this
  back on 2026-08-20 but had no caller until now. Used by
  `q-wash-admin`'s new-point wizard, finally wired to real submission
  this session (phase E — see its own `PROGRESS.md` for the map-picker
  and wizard-scope decisions that unblocked it).
- 2026-08-22 (later, same day) — Added `washing_point_id: string | null` to
  the `User` type, matching `q-wash-api`'s new `GET /me`/login response
  field (see its own `PROGRESS.md`) — a small, explicitly-approved API
  addition made specifically to unblock `q-wash-cabinet`'s auth, since its
  locked-in "no point picker" design needs the logged-in staff user's own
  point id and no endpoint previously exposed it.
- 2026-08-22 (later still, same day) — Built out the rest of Phase D for
  `q-wash-cabinet`'s three real tabs (see its own `PROGRESS.md` for the
  full story):
  - `Service`/`PriceOption`/`ServiceCreate`/`ServiceUpdate`/
    `PriceOptionInput` types and `api/services.ts`
    (`listServices`/`createService`/`updateService`/`deactivateService`/
    `createPriceOption`/`updatePriceOption`/`deletePriceOption`).
  - `ScheduleRow`/`ScheduleList` types and `api/schedule.ts`
    (`getSchedule`/`replaceSchedule`).
  - `Photo`/`PhotoList`/`PhotoUpdate` types and `api/photos.ts`
    (`listPhotos`/`uploadPhoto`/`updatePhoto`/`deletePhoto`).
  - `WashingPointUpdate` type and `getWashingPoint`/`updateWashingPoint` in
    `api/washingPoints.ts`. Also corrected `WashingPoint.description`/
    `.amenities` from `string | null`/`string[]` to optional
    (`description?`/`amenities?`) — `API.md` documents both as *omitted*
    from the JSON body when unset, not sent as `null`/`[]`, which the
    original types (written before any screen read them) got wrong.
  - `Toggle` component (`components/Toggle.tsx`) — deferred back on
    2026-08-20 ("no built screen needs it yet, add it when
    `q-wash-cabinet` needs it"); first real use is its Услуги tab's
    active/inactive switch and Часы работы's per-day on/off switch.
  - Two real fixes to `api/client.ts`, both found because
    `q-wash-cabinet`'s Фото tab was the first screen in the platform to
    touch file uploads or serve back an uploaded asset: `apiRequest` was
    unconditionally forcing `Content-Type: application/json`, which
    breaks a `multipart/form-data` photo upload (the browser must set its
    own boundary) — now skipped when the request body is a `FormData`.
    Added `resolveApiAssetUrl()`, since uploaded photos are served from a
    top-level `/uploads/...` path outside `/api/v1`
    (`q-wash-api/internal/platform/httpserver`), so rendering one needs
    the API's origin, not the app's own — derived once from
    `API_BASE_URL`'s own origin, not a second configured value.
  - A few more Russian error-code messages added to `errors.ts`
    (`invalid_content_type`, `file_too_large`, `invalid_hours`,
    `invalid_break`, `invalid_schedule`, `cannot_unset_default`,
    `last_price_option`, `price_option_in_use`,
    `multiple_default_price_options`) — the first validation codes from
    `q-wash-api`'s services/schedule/photos endpoints any built screen
    actually surfaces to a user.

- 2026-08-26 — **Boxes resource added** (`api/boxes.ts` +
  `Box`/`BoxList`/`BoxCreate`/`BoxUpdate` in `types.ts`), same 4-file
  list/create/update/delete shape as `photos.ts`/`services.ts`, backing
  `q-wash-cabinet`'s newly-unblocked Боксы tab (`Box` entity shipped in
  `q-wash-api` phase 6, verified against real Postgres this session — see
  `q-wash-api/PROGRESS.md`). Response shape is intentionally minimal
  (`id`/`number`/`label`/`is_open`) — matches the real API exactly, no
  speculative fields for the mock's services-count/slot-length/
  today's-bookings stats, which the backend doesn't compute per-box
  (decided with the user rather than guessed).

- 2026-08-26 (later, same day) — **Queue resource extended for
  `q-wash-worker`'s Phase C** (its box-cards + today's-queue screen, wired
  to real data this session — see its own `PROGRESS.md`). Added to
  `api/queue.ts`: `listQueueByWashingPoint(id, date?)`
  (`GET .../queue?date=`), `getBoxesLive(id)` (`GET .../boxes/live`),
  `pauseBooking`/`resumeBooking`/`cancelBooking`
  (`PATCH .../pause|resume|cancel`) — `listQueueNetworkWide`/
  `updateBookingStatus` already existed (admin-only board) but nothing
  worker-scoped did yet. New `LiveBoxBooking`/`LiveBox`/`LiveBoxList`
  types matching `queue.Handler.boxesLive`'s response exactly; added the
  missing `paused_at?: string` to the existing `BoardItem` type (the real
  `boardItemResponse` always had it, the type had just never been checked
  against it since no screen read that field before). Added five error
  codes to `errors.ts`'s Russian map — `cannot_pause`, `cannot_resume`,
  `cannot_cancel`, `invalid_status_transition`, `queue_not_found` — the
  first codes `PATCH /queue/{id}/pause|resume|status|cancel` can actually
  surface to a screen, verified against the real API's wire format via
  `curl` (see `q-wash-worker/PROGRESS.md`), not guessed from the Go source.

- 2026-08-26 (later, same day) — **`getDisplayBoard`** (`api/queue.ts`) +
  `DisplayBoard`/`DisplayBoardBox`/`DisplayBoardBooking`/
  `DisplayBoardWaitingItem` types, matching the new
  `GET /washing-points/{id}/board` endpoint (`q-wash-api` phase 8) for
  `q-wash-display`'s one screen — see its own `PROGRESS.md`.

  **Real bug found and fixed in `auth/authStore.ts`**, not
  display-specific but found *because of* display's own resilience
  testing (this is the one app that reloads unattended, so it's the one
  where the bug actually bit): `restore()`'s bare `catch { tokenStorage
  .clear(); ...unauthenticated }` treated a plain network failure from
  `getMe()` identically to a real logged-out session — clearing perfectly
  valid tokens and forcing every app back to its login screen on nothing
  more than a transient blip at the wrong moment. Every one of the four
  web apps calls `restore()` on mount; it just never mattered for the
  other three, since a human reloading an interactive app during a
  network hiccup would just retry and rarely even notice a flash of the
  login screen. Fixed: `restore()` now retries up to 5 times with
  exponential backoff specifically when the error is
  `ApiError('network_error', ...)`, only clearing tokens and going
  `unauthenticated` on an actual rejection (any other `ApiError` code —
  expired/revoked token, 403, etc.) or once retries are exhausted.
  Re-typechecked `q-wash-admin`/`q-wash-cabinet`/`q-wash-worker` against
  this change — all clean, no regressions, and all three benefit from the
  fix even though none of them surfaced the bug themselves.

- 2026-08-31 — **New `src/sse/client.ts`**, built to support
  `q-wash-display`'s Phase D (SSE upgrade, resumed after being deferred),
  which needed a way to consume `q-wash-api`'s new
  `GET /washing-points/{id}/board/events` stream. Not part of the original
  Phase D (Resource modules) — this is transport, not a resource module.

  Native browser `EventSource` cannot attach the `Authorization: Bearer`
  header every `q-wash-api` route requires, so `subscribeToBoardEvents`
  hand-rolls the SSE protocol over `fetch()`'s `ReadableStream` instead:
  attaches the bearer token from the existing `tokenStorage`, parses
  `data: ...\n\n` frames, skips `: ping` heartbeat comment frames. Exported
  `API_BASE_URL` from `api/client.ts` (was module-private) so this module
  can build the stream URL without duplicating that resolution logic —
  `apiRequest` stays the only thing that knows about auth/refresh.

  Reconnects indefinitely with capped exponential backoff (1s doubling up
  to a 30s cap) rather than `authStore.restore()`'s bounded 5-attempt
  retry — there's no equivalent "give up" state for a board stream, since
  the caller's own polling fallback (see `q-wash-display/PLAN.md`'s
  "polling ships first" decision) keeps the screen usable regardless of
  how long the stream itself takes to reconnect.

  `tsc -b`/`oxlint` clean here; re-typechecked `q-wash-admin`/
  `q-wash-worker`/`q-wash-cabinet` against this change too — all clean, no
  regressions (none of the three consume the new module yet, only
  `q-wash-display` will). No test runner exists in this package (see
  `docs/testing.md`) — correctness is verified live in
  `q-wash-display/PROGRESS.md`'s own entry instead.

- 2026-08-31 — **Test infra added.** This package holds logic every one of
  the four web apps depends on, so a bug here breaks four apps silently —
  yet had zero tests. Added Vitest (`vitest`, `jsdom` devDeps, `npm test`
  runs `vitest run`), `vitest.config.ts` (jsdom environment). 22 tests
  across 4 files, all passing:
  - `api/errors.test.ts` — `messageForCode` known/fallback, `ApiError`
    shape.
  - `api/client.test.ts` — `apiRequest`'s single-flight refresh-on-401
    (concurrent 401s trigger exactly one `/auth/refresh` call), retry-once
    semantics (a second 401 after refresh throws instead of looping),
    `network_error` on a rejected `fetch`, 204 handling, `skipAuth`
    bypassing refresh entirely.
  - `auth/authStore.test.ts` — `restore()`'s no-token/success/non-network-
    rejection/network-retry/give-up-after-5 paths (fake timers for the
    backoff), `login()`, `logout()` clearing tokens even when the request
    itself fails. Each test gets a fresh `AuthStore` singleton via
    `vi.resetModules()` + dynamic re-import — first pass mixed a
    statically-imported `ApiError` class with the store's freshly
    re-evaluated one, so `err instanceof ApiError` silently failed inside
    `restore()`; fixed by importing `ApiError` from the same fresh module
    graph as the store in every test that constructs one.
  - `sse/client.test.ts` — `subscribeToBoardEvents` frame parsing (skips
    `: ping`, reports a malformed frame via `onError` without dropping the
    stream), exponential backoff up to the 30s cap (verified against a
    formula, not a fixed call count, so it holds at any elapsed time),
    `unsubscribe()` actually stopping the reconnect loop.

  `npx tsc --noEmit` clean. No lint script exists in this package.
  Updated `docs/testing.md`'s q-wash-shared bullet (was "not yet
  scaffolded") to record the Vitest decision.

- 2026-09-19 — **New palette/font/logo from Claude Design applied.**
  Imported the refreshed mock ("Car Wash Web Apps.dc.html", project
  `f6bd39c5-b19d-4809-8dd5-e05719c4f6e9`) via the `DesignSync` tool's read
  methods (not `/design-sync` — that skill pushes a local component
  library *up to* claude.ai/design; this was the opposite direction, pulling
  a design's palette/font/logo *down* into the app, so its read-only
  `get_project`/`list_files`/`get_file` methods were used directly).
  - `theme/tokens.ts`: every `color.*` value replaced (near-black
    `#0A0A09` base instead of the old warm `#0b0a0b`/gold-brown palette;
    same token names/roles throughout, so no consumer changed). `font.*`
    collapsed to a single `"Sora"` family for both `display` and `body`
    (was serif `Prata` + sans `Manrope`). `radius.*`/`shadow.*` unchanged.
  - Dropped self-hosted `theme/fonts.css` and `assets/fonts/{Manrope-
    Variable,Prata-Regular}.ttf` — user chose Google Fonts CDN over
    self-hosting Sora, so each app now loads it via `<link>` tags in its
    own `index.html` instead.
  - Added `components/LogoMark.tsx` (gold rounded square, 3 stacked bars,
    `size` prop) replacing the old bordered single-letter badge used
    across all four apps' sidebar/header/login screens.
  - `npm run typecheck` and `npm test` (22/22) both clean.
