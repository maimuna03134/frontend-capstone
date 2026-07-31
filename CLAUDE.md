# CLAUDE.md — project rules

> See [`AGENTS.md`](./AGENTS.md) first — this Next.js version has breaking
> changes vs. older training data; read the relevant doc in
> `node_modules/next/dist/docs/` before assuming an API works the old way.

## Stack

- Next.js 16 (App Router), JavaScript — no TypeScript
- Tailwind CSS v4, config lives in `app/globals.css` via `@theme` (not a
  `tailwind.config.js`)
- Deployed on Vercel; every push gets a preview URL

## Conventions

1. **Server Components by default.** Only add `"use client"` when a
   component needs state, event handlers, or a browser API. Right now the
   only Client Component is `app/components/Navbar.js` (needs
   `usePathname` and a mobile-menu toggle).
2. **`params` and `searchParams` are Promises** in this Next.js version —
   always `await` them before reading, e.g. `const { id } = await params`.
3. **File-based routing only.** Every screen gets a real folder + `page.js`
   under `app/` — no client-side route table or a router library.
4. **Design tokens live in one place.** Colors and fonts are defined once
   in `app/globals.css`'s `@theme` block (`--color-ink`, `--color-teal`,
   `--font-display`, etc.) — never hardcode a hex value or font name
   directly in a component's className.
5. **No secrets committed.** Anything sensitive (API keys, Firebase
   config) goes in `.env.local` (gitignored), with a placeholder entry
   mirrored in `.env.example` so the required variables stay documented.
6. **Forms use react-hook-form + zod, never an uncontrolled `useState` per
   field** — carried over from the FE-03 workflow drill.

Commit format: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
(`feat:`, `fix:`, `chore:`, `docs:`, ...) — required from FE-01 onward.
