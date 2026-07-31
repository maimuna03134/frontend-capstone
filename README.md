# ShopFront — Capstone project

A product catalog capstone for the Frontend AI Engineering track — browse
products, search/filter/sort, save favorites, and check out. Built with
Next.js App Router and deployed from day one.

## Live preview

(add the Vercel preview URL here once deployed)

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
