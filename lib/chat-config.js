/**
 * Chat model + system prompt configuration.
 *
 * Everything the streaming assistant needs to know about WHICH model to call
 * and HOW it should behave lives in this one file, per the FE-06 brief — and
 * FE-07 extends this same route handler next, so keeping it isolated here
 * (instead of inline in the route handler) means there's exactly one place
 * to touch later.
 *
 * Model access goes through Google's Gemini API directly (the @ai-sdk/google
 * provider) — it has a genuine no-credit-card free tier, unlike the Vercel
 * AI Gateway used earlier, which needs pre-purchased credits. Get a free
 * key at https://aistudio.google.com and set it as
 * GOOGLE_GENERATIVE_AI_API_KEY (server-side only — see .env.example).
 * Swapping models is still a one-line change here.
 *
 * Using gemini-3.6-flash (GA as of Aug 2026) rather than 2.5 Flash: Google
 * has stopped letting new projects call 2.5 Flash ahead of its scheduled
 * October 2026 shutdown, and returns a 404 for those requests instead of
 * the usual auth/quota errors — worth knowing if this ever needs updating
 * again, since that failure mode looks nothing like a missing API key.
 */

import { google } from "@ai-sdk/google";

export const CHAT_MODEL = google("gemini-3.6-flash");

export const SYSTEM_PROMPT = `You are the ShopFront shopping assistant.

ShopFront is a demo storefront (catalog data comes from the public Fake
Store API — clothing, jewelry, electronics). Help visitors:
- find products that match what they're describing
- compare options (price, category, what fits a stated need)
- answer general shopping questions (sizing, materials, care)

Keep answers short — two or three sentences unless the person clearly asks
for more detail. You do not have live access to real product data, current
prices, or stock levels in this conversation, so never invent specific
product names, prices, or availability — say plainly that you can't check
that and point them to the catalog page instead. You also can't place
orders or access anyone's account or cart; redirect those requests to the
actual shop and checkout flow.`;

// Response streaming can legitimately take a while on a slow connection or
// a long generation — cap it so a stuck request doesn't hang the function
// forever. Next.js route segment config reads this directly (see route.js).
export const MAX_DURATION_SECONDS = 30;
