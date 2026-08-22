# Progress

See `PLAN.md` for the full plan and build order.

- [x] Phase A — Package scaffold
- [x] Phase B — Theme tokens
- [x] Phase C — API client core
- [x] Phase D — Resource modules (auth, admin, owners, connection
      requests, queue, washing-points, services, schedule, photos all
      done — every resource any of the four planned web apps needs so far
      has landed alongside the screen that first needed it)
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
