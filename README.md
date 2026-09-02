# q-wash-shared

Not an app — a TypeScript package the four staff/admin web apps
(`q-wash-admin`, `q-wash-cabinet`, `q-wash-worker`, `q-wash-display`)
depend on, so `q-wash-api` integration, auth, and the shared visual
design language are written once instead of four times. Framework-
agnostic aside from React itself; no build step — consumed as raw TS
source.

Design decisions live in `PLAN.md`; the phase-by-phase implementation log
lives in `PROGRESS.md`. Both are the source of truth for this package's
internals — this file is just how to consume/develop it.

## How apps depend on it

Each of the four apps takes it as a plain npm local-path dependency (not a
workspace — each app stays a genuinely separate top-level project):

```json
"dependencies": {
  "q-wash-shared": "file:../q-wash-shared"
}
```

`package.json`'s `main`/`types`/`exports` point straight at `src/index.ts`
— npm symlinks the package into each consuming app's `node_modules` on
install, and Vite transpiles it on the fly like any other source file, no
separate build step.

## What's in it

```
src/
  theme/          design tokens (colors, type scale, radii), Prata/Manrope
                 fonts — matches q-wash (mobile)'s theme 1:1
  api/            typed fetch client for q-wash-api: base client (bearer
                 attach, single coalesced 401 refresh-and-retry-once),
                 one module per resource (washingPoints, owners, services,
                 boxes, queue, schedule, photos, connectionRequests,
                 admin, auth), Russian error-code map
  auth/            token storage (localStorage) + auth-state store
                 (login/logout/restore-on-load/role check) — each app
                 wires it into its own router's redirect logic
  sse/             subscribeToBoardEvents — hand-rolled SSE over fetch()'s
                 ReadableStream (native EventSource can't attach the
                 Authorization header these routes need), with
                 exponential backoff up to a 30s cap
  components/      StatusPill, Toggle, buttons, StatCard, Panel, DataTable
                 — built against the design mock's exact styles, not a
                 general-purpose component library
```

## Development

```bash
npm run typecheck   # tsc --noEmit
npm test             # vitest run
```

No `dev`, `build`, or `lint` script here — this package has no standalone
runtime and no build step of its own; it's exercised through whichever
consuming app's `npm run dev`/`build` picks it up.

## Adding a new resource or endpoint

Match an existing module in `src/api/` (one file per `q-wash-api` resource
group, hand-written types against `q-wash-api/docs/openapi.yaml` — no
codegen, see `PLAN.md`'s "API types" decision). Add a test in the matching
`*.test.ts` file alongside it.
