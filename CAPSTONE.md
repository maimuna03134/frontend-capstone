# ShopFront — Capstone Submission (Ship It)

## Project Brief

ShopFront's AI assistant solves a small but real friction point in online
shopping: figuring out what something will actually cost — with tax and
shipping — before committing to checkout. Rather than mentally totaling
items or switching between a calculator and a cart page, a shopper can
describe what they're considering in plain language ("2 t-shirts at $15
each and a jacket for $60") and get an accurate, itemized breakdown
instantly, alongside plain-language help with sizing and category
questions. It's built for casual online shoppers who want a quick answer
without doing math or hunting through filters. I chose this direction
because it let me build something a real tool call could meaningfully
improve — an actual calculation with real business logic (tax, a
free-shipping threshold) — rather than bolting a chatbot onto a static
catalog page that just echoes text back.

## Live, deployed application

**https://frontend-capstone-wine.vercel.app/**

Primary flow: **[/assistant](https://frontend-capstone-wine.vercel.app/assistant)**

## Repository

**https://github.com/maimuna03134/frontend-capstone**

Full setup instructions, architecture overview, AI integration details,
and known limitations are in [`README.md`](./README.md).

## Testing evidence

✓ app/login/LoginForm.test.js (4 tests)
✓ app/assistant/Chat.test.js (11 tests)
✓ app/assistant/CartSummaryCard.test.js (4 tests)
✓ lib/rate-limit.test.js (7 tests)

Test Files 4 passed (4)
Tests 26 passed (26)

(Screenshot of the above: `docs/screenshots/test-output.png`)

Plus one Playwright end-to-end test covering the primary flow
(`e2e/assistant-primary-flow.spec.js`), run automatically in CI on every
push (`.github/workflows/ci.yml`).

## Performance & accessibility audit

Full before/after Lighthouse + WAVE audit in [`AUDIT.md`](./AUDIT.md).
Summary: Lighthouse Accessibility went **96 → 100** on both audited pages
(Home, Assistant), and WAVE errors went **1 → 0**.

**One concrete improvement from the audit:** WAVE flagged the chat
message `<textarea>` as having no associated label (placeholder text
isn't a substitute — it disappears once you start typing, and isn't
reliably exposed to all screen readers). Fixed by adding a proper
`<label htmlFor="chat-message">` tied to the textarea's `id`, verified by
re-running WAVE and confirming the error count dropped from 1 to 0.

## Deployment & operation

### Deployment checklist

- [x] `GOOGLE_GENERATIVE_AI_API_KEY` set in Vercel (Production + Preview)
- [x] `npm run lint` — 0 errors
- [x] `npm run test` — 26/26 passing
- [x] `npm run test:e2e` — primary flow passing
- [x] CI green on `main` (`.github/workflows/ci.yml`)
- [x] Lighthouse Accessibility 100/100 (mobile), Performance 88+
- [x] 0 WAVE errors on audited pages
- [x] Rate limiting + input caps live on the AI route
- [x] Error boundaries in place (`app/error.js`, `app/assistant/error.js`)
- [x] Cross-browser check: Chrome, Firefox, Safari/mobile Safari
- [ ] Custom domain (optional — not done, using the default Vercel URL)

**How it fails safely:** network/provider errors show a categorized,
human-readable banner with a working retry (never a raw stack trace);
tool errors (e.g. an over-limit quantity) render as a designed error
card, not a crash; route-level errors are caught by `error.js` boundaries
with a "try again" action; and the rate limiter returns a plain 429
before the model is ever called, so abuse fails safely and cheaply.

**Rollback plan:** deployments are git-based via Vercel — every push to
`main` creates a new deployment, and Vercel keeps prior ones. To roll
back: either revert the bad commit and push (triggers a fresh deploy), or
go to the Vercel dashboard → Deployments → pick a previous good one →
"Promote to Production." No dedicated monitoring/alerting is wired up
yet beyond Vercel's own deployment status page — that's a known gap.

## Reflection

**What was hardest? Why?**

The hardest part was fixing a bug where JSX was not being detected correctly in a .js file in the Vitest/Vite configuration. I had to try different solutions, such as configuring the esbuild loader and using the React plugin with the correct include settings, before I could fix it.

I also faced some Windows environment issues. For example, grep did not work in PowerShell, and having spaces in file paths sometimes caused test timeouts. These problems were not related to my code, but they made debugging more difficult.

Another challenging part was understanding exactly what each assignment required. Sometimes I was unsure whether I should work in the same file or create a separate one, or where I should take the required screenshots. Understanding the requirements took some extra time.

**What would you do differently next time?**

Next time, I would make it a habit to run all the tests locally before pushing my code to GitHub. In a few cases, I pushed the code first and later discovered that I had missed some fixes. Testing everything locally first would help me catch these issues earlier.

I would also avoid using spaces in file and folder paths, especially when working on Windows, because they can sometimes cause unexpected problems.

Before starting an assignment, I would also read the Q&A section first. It often contains useful clarification about the requirements, and reading it earlier could save time and prevent confusion.

**One thing I learned that surprised me:**

One thing that surprised me was that color contrast can actually be calculated mathematically. For example, a contrast ratio can be an exact value like 2.98:1, so it is not enough to judge accessibility just by looking at the colors.

I was also surprised to learn that an AI tool call can have four different states—streaming, available, output, and error. Before this, I thought of it more simply as just a loading spinner.

Finally, writing tests taught me something important: tests do not only verify that code works; they can also help find real bugs. While testing the LoginForm, I found an issue with the email error message that I had not noticed before writing the test.