# ShopFront — Capstone project

A product catalog capstone for the Frontend AI Engineering track — browse
products, search/filter/sort, save favorites, and check out. Built with
Next.js App Router and deployed from day one.

## Live preview

https://frontend-capstone-wine.vercel.app/

## AI tools

### `calculateCartSummary`

Calculates an order total for items a shopper describes in chat —
subtotal, 8% flat tax, shipping (flat $5, free at $50+), and total.

**Input** (`lib/tools.js`, Zod-validated)
- `items`: array (min 1) of `{ name: string, quantity: number (1–20), unitPrice: number (> 0) }`

**Output (success)**
`{ items: [...with lineTotal], subtotal, tax, shipping, total, currency: "USD" }`

**Errors**
Throws if any item requests more than 20 units ("exceeds available
stock") — renders as a designed error card, not a crash.

**UI states** (`app/assistant/Chat.js`)
| State | Rendered as |
|---|---|
| `input-streaming` | "Reading the order..." shell |
| `input-available` | "Calculating totals..." shell + parsed item list |
| `output-available` | `CartSummaryCard` — itemized summary card |
| `output-error` | `CartSummaryError` — red error card |


## Error, empty, and edge-case handling

Primary flow: the AI Shopping Assistant (`/assistant`) — the only fully
wired flow in the app so far. Inventory of failure/edge cases and how each
is handled:

| Case | Handled by | How |
|---|---|---|
| Network failure before send | `getErrorCopy()` in `Chat.js` | Detects offline/fetch errors client-side, shows "check your connection" copy |
| API error mid-stream | `route.js` `categorizeError()` + `useChat`'s `error` | Server maps the raw error to a safe token (`rate-limit` / `network` / `server`); client shows matching copy, never the raw message |
| Rate limit (429) | Same as above | `rate-limit` token → "getting a lot of requests, wait a few seconds" |
| Malformed/failed tool execution | `calculateCartSummary`'s thrown error → `output-error` tool part | `CartSummaryError` component |
| Empty input | `handleSubmit` guard + disabled Send button | Can't submit whitespace-only input |
| First-run empty state | Suggested-prompt chips in `Chat.js` | Three click-to-send examples, one of which demos the cart tool |
| Slow response | `ThinkingIndicator` | Skeleton-shaped shell sized like a short reply, not a spinner, to minimize layout shift |
| Route render failure | `app/error.js`, `app/assistant/error.js` | Designed fallback with Try again / Homepage |
| Double-clicking retry | `isRetrying` guard in `Chat.js` | Second click while a retry is in flight is ignored |

**Mobile Safari fixes:** `dvh` instead of `vh` (avoids address-bar resize
jump), 16px textarea on small screens (iOS auto-zooms inputs under 16px),
`overscroll-contain` on the scroll container so rubber-band scroll doesn't
fight the pinned auto-scroll.


## 3D product preview

`/3d-preview` — an interactive product configurator built with React Three
Fiber: drag to orbit, pinch/scroll to zoom, and swap the color or finish
(matte/satin/glossy) on a procedurally-built mug (cylinder + torus, no
external model file).

**Perf note:** no `.glb`/model asset at all — the geometry is built from
primitives, so there's zero model download weight. The `three` +
`@react-three/fiber` + `@react-three/drei` bundle (~150KB+ gzipped) is
kept off the initial page load via `next/dynamic(..., { ssr: false })`,
loaded only once `/3d-preview` mounts. Pixel ratio is capped at 2
(`dpr={[1, 2]}`) so high-DPI phones don't render more pixels than needed,
`powerPreference: "low-power"` hints the GPU to favor battery, and shadows
use a single cheap `<ContactShadows>` blob instead of a full shadow map.
No HDRI environment map — lit with three plain lights instead, to skip an
extra texture download. Falls back to a static (non-WebGL) panel when
`prefers-reduced-motion` is set or WebGL isn't available, with an
explicit "show anyway" opt-in rather than silently forcing motion.

**With more time:** swap the procedural mug for a real (Draco-compressed)
`.glb` product model with drag-and-drop loading, and wire this into an
actual product detail page once the catalog is real (FE-04+).


## Stack

- Next.js 16 (App Router, JavaScript — no TypeScript)
- Tailwind CSS v4 (design tokens in `app/globals.css`)
- Vercel (hosting + automatic preview deployments)
- Planned: Firebase (Auth + Realtime Database) for accounts, favorites, and
  orders — added once the app needs a real backend

## Routes (current skeleton)

| Route             | Screen                                    |
| ----------------- | ------------------------------------------ |
| `/`                | Product catalog                            |
| `/products/[id]`   | Product detail                             |
| `/cart`            | Cart                                       |
| `/checkout`        | Checkout                                   |
| `/favorites`       | Favorites                                  |
| `/login`           | Log in / sign up                           |
| `/account`         | Account settings                           |
| `/health`          | Health check — confirms live data fetching |

Every route above is currently a placeholder screen describing what it will
do; features get built out in later assignments.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Testing

\`\`\`bash
npm run test        # Vitest + React Testing Library (component tests)
npm run test:watch  # same, watch mode
npm run test:e2e    # Playwright end-to-end (installs browsers once: npx playwright install --with-deps)
\`\`\`

Component tests never call the real AI route — `@ai-sdk/react`'s `useChat`
is mocked in `Chat.test.js`, and the Playwright E2E test mocks
`/api/chat` with a hand-built (protocol-accurate) response instead of
hitting a real model.

| Test file | Covers |
|---|---|
| `app/assistant/Chat.test.js` | Chat message renderer — empty state, text messages, pending/streaming status, categorized error + retry, and all four tool-call states |
| `app/assistant/CartSummaryCard.test.js` | The tool-result component in isolation (line items, totals, free vs. paid shipping) |
| `app/login/LoginForm.test.js` | The validated login form — labels, empty-submit errors, invalid-email error, valid submit |
| `e2e/assistant-primary-flow.spec.js` | Primary flow end-to-end: ask the assistant a question, see it answered |

CI (`.github/workflows/ci.yml`) runs lint + both test suites on every push
and pull request to `main`.


## Project docs

- [`CLAUDE.md`](./CLAUDE.md) — stack, conventions, and rules for AI-assisted
  work on this repo.


