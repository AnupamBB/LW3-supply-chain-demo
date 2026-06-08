# LW3 Supply Chain — Product Lifecycle Tracker

Tracks the lifecycle of a physical product through a supply chain. A product is
registered at manufacture and accumulates **append-only** events as it moves
through stages (manufactured → shipped → received → sold → recycled). The event
history is the source of truth, and each event is cryptographically chained to
the previous one so the history can be verified end-to-end.

## Quick start (< 5 minutes)

**Prerequisites:** Node.js 18+ and a local MongoDB running on
`mongodb://localhost:27017`.

```bash
# 1. install (npm workspaces — installs every app/service/web at once)
npm install

# 2. seed the database (2,000 products + verifiable event chains)
npm run seed

# 3. run everything (auth, products BFF, products service, web UI)
npm run dev
```

Then open **http://localhost:3000**. Log in with one of the demo users below,
paste a product `_id` (the seed script prints a couple, or list them via the
API), and you'll see the event timeline, a verify button, and an add-event form.

No `.env` is required — sensible local defaults live in `common/config.js`. Copy
`.env.example` to `.env` to override (Mongo URI, JWT secret, ports).

### Demo users

| Email                  | Password      | Role     | Scope            |
| ---------------------- | ------------- | -------- | ---------------- |
| `internal@lw3.com`     | `password123` | internal | full access      |
| `partner1@company.com` | `password123` | partner  | `partner-1` only |
| `partner2@company.com` | `password123` | partner  | `partner-2` only |

## Architecture

The repo is an npm-workspaces monorepo with a deliberate split between a
public-facing gateway layer and internal data-owning services:

```
client ──HTTP──> apps/products (BFF, :3002) ──HTTP──> services/products (:3003) ──> MongoDB
                  • JWT auth                            • owns the Mongoose models
                  • role authorization                 • append-only enforcement
                  • role-aware rate limiting           • hash-chain + verify logic
                  • partner ownership scoping
client ──HTTP──> apps/auth (BFF, :3001) ─────HTTP──> services/auth (:3004) ──────> MongoDB
                  • thin proxy                          • owns the users collection
                                                        • bcrypt verify + JWT mint
static/web (:3000) — minimal React UI
common/ — shared config, db, logger, middleware, and the BFF→service HTTP client
```

- **`apps/*`** — the public REST API (a BFF/gateway). Owns *who can do what*:
  authentication, authorization, rate limiting, request validation, and partner
  scoping. It holds no database logic; it calls down to services over HTTP.
- **`services/*`** — internal microservices that own MongoDB. `services/products`
  owns the products/events collections and all integrity logic. Not exposed
  publicly.
- **`common/`** — shared layer: `config`, `db`, `log`, the auth/authorize/rate-limit
  middleware, and the typed HTTP client the BFF uses to reach services.

I kept this two-tier structure as-is and implemented the task within it.

## API

All `/products` routes require `Authorization: Bearer <jwt>`.

| Method | Endpoint                | Role            | Purpose                              |
| ------ | ----------------------- | --------------- | ------------------------------------ |
| POST   | `/login`                | public (:3001)  | Get a JWT                            |
| POST   | `/products`             | internal        | Register a new product               |
| POST   | `/products/:id/events`  | internal        | Append a lifecycle event             |
| GET    | `/products/:id`         | internal/partner| Product + full event history         |
| GET    | `/products`             | internal/partner| List with filters + pagination       |
| GET    | `/products/:id/verify`  | internal/partner| Verify the event chain is intact     |

Writes are internal-only. Partners are read-only and are transparently scoped to
their own `partnerId` (they cannot read or list other partners' products).

**List filters:** `status`, `partnerId`, `from`/`to` (createdAt range), `page`,
`limit`. For partners, `partnerId` is forced to their own regardless of input.

## The hard parts

### Append-only events (enforced at the data layer)

Two layers of enforcement on `services/products/models/event.model.js`:

1. **Every field is `immutable: true`** — Mongoose silently drops any attempt to
   change a field on an existing document (via `save()` or the
   `findOneAndUpdate` family).
2. **All update/delete query middleware throws** — `updateOne`, `updateMany`,
   `replaceOne`, `findOneAndUpdate`, `deleteOne`, `deleteMany`,
   `findOneAndDelete` are all blocked outright. The collection can only grow.

Verified in testing: model-level `updateOne`/`deleteOne` both throw
`"Events are append-only and cannot be modified/deleted"`.

The seed script's reset is the *only* path that clears events, and it does so at
the raw driver level (`connection.collection('events').deleteMany`), which
intentionally bypasses the model guards — that's an admin/dev operation, not an
application path.

### Event chain + verification

Each event stores `sequence` (0-based position), `previousEventId`,
`previousHash`, and its own `hash`:

```
hash = sha256( stableStringify({ productId, type, payload, sequence, previousHash, createdAt }) )
```

`stableStringify` sorts object keys recursively so the hash is independent of key
order or BSON round-tripping. Folding `previousHash` into each hash is what makes
this a *chain*: tampering with any event's content changes its hash, which breaks
the `previousHash` link of every event after it.

`GET /products/:id/verify` walks the chain in `sequence` order and checks, for
each event:

1. **Contiguous sequence** — no gaps or reordering.
2. **Content integrity** — recompute the hash from stored fields; a mismatch
   means the content was modified.
3. **Linkage** — `previousHash`/`previousEventId` match the prior event (and the
   genesis event references nothing).

On failure it returns `{ valid: false, brokenAt: { index, eventId, reason } }`.
Verified in testing: a raw-driver tamper on an event's payload is caught with
`reason: "content hash mismatch (event was modified)"`.

### Auth

JWT with two roles (`internal`, `partner`) signed by `apps/auth`. `authenticate`
middleware verifies the token; `authorize('internal')` gates writes. Partner
scoping is enforced in the products BFF controller for reads (ownership check on
`GET /:id` and `/verify`, forced `partnerId` filter on list).

### Rate limiting

A single role-aware limiter (`common/middleware/rateLimiter.js`) applied after
authentication: **internal = 1,000 / 15 min, partner = 100 / 15 min**, keyed by
partner/user identity (falling back to IP) so one noisy partner can't exhaust the
shared budget.

### Performance at 100k+ products

The list endpoint is the scale concern. Design choices:

- **Compound index** `{ partnerId, status, createdAt: -1 }` on products covers the
  common access pattern (a partner browsing their catalogue, newest first, with a
  status filter), plus single-field indexes on `partnerId` and `status`.
- **`.lean()`** everywhere on reads — returns plain JS objects, skipping Mongoose
  hydration overhead.
- **`Promise.all`** for the `find` + `countDocuments` pair so they run in parallel.
- Events use a **unique `{ productId, sequence }`** index — fast in-order history
  reads *and* it doubles as the concurrency guard for appends (see below).

## Assumptions

- **Event content.** Beyond `type` and `createdAt`, each event carries a free-form
  `payload` (e.g. `{ note, location }`). The lifecycle `type` enum is fixed to the
  five canonical stages; I kept it strict for data integrity over open-endedness
  (a documented tradeoff — easy to relax).
- **Product ownership** is set by the registering internal user via `partnerId` in
  the request body. Partners never create.
- **Users live in MongoDB** (`services/auth` owns the `users` collection).
  Passwords are bcrypt-hashed; the auth service verifies credentials and mints
  the JWT, and the `apps/auth` BFF is a thin proxy. The demo accounts above are
  created by `npm run seed`. Registration/refresh-token flows are out of scope.
- **`status`** on a product mirrors its latest event `type`.

## Tradeoffs / what I'd do with more time

- **Append concurrency.** Two simultaneous appends to the same product could race
  for the same `sequence`. The unique `{ productId, sequence }` index makes this
  *safe* (one wins, the other gets a 409 "retry"), but I didn't add automatic
  retry or a MongoDB transaction (transactions need a replica set; I optimized for
  a one-command local run). With more time: a transactional append or an
  optimistic-retry wrapper.
- **DB-backed auth.** Move users into `services/auth` + Mongo, add registration,
  refresh tokens, and password rotation.
- **Tests.** I verified the hard parts manually end-to-end (append-only guards,
  tamper detection, scoping, filters, rate-limit headers). I'd add a Jest +
  mongodb-memory-server suite covering exactly those, and run it in CI.
- **Observability & validation.** Swap the console logger shim for real `pino`,
  add request validation with `zod`/`joi`, and structured error codes.
- **Cursor pagination.** Offset pagination (`skip`) degrades on deep pages at
  scale; I'd offer `createdAt`/`_id` cursor pagination for the 100k+ case.
- **Frontend.** Intentionally minimal (no build step — React via CDN, two screens).
  Not polished, per the brief.

## Project layout

```
apps/
  auth/         auth BFF / gateway — thin proxy (:3001)
  products/     public products BFF/gateway (:3002)
services/
  products/     products data service + Mongoose models (:3003)
    models/     product.model.js, event.model.js
    utils/      chain.js — shared hash logic (used by service + seed)
  auth/         auth data service — owns users, bcrypt + JWT (:3004)
    models/     User.js
    utils/      demoUsers.js — seed accounts
common/         config, db, log, middleware, BFF→service HTTP client
static/web/     minimal React UI (:3000)
scripts/seed.js seeds users + products + verifiable event chains
```
