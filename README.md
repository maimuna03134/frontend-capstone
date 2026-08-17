# ShopFront — Capstone project

A product catalog capstone for the Frontend AI Engineering track — browse
products, search/filter/sort, save favorites, and check out. Built with
Next.js App Router and deployed from day one.

## Live preview

(add the Vercel preview URL here once deployed)

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

## Project docs

- [`CLAUDE.md`](./CLAUDE.md) — stack, conventions, and rules for AI-assisted
  work on this repo.


