/**
 * Chat model + system prompt configuration.
 *
 * Everything the streaming assistant needs to know about WHICH model to call
 * and HOW it should behave lives in this one file, per the FE-06 brief — and
 * FE-07 extends this same route handler next, so keeping it isolated here
 * (instead of inline in the route handler) means there's exactly one place
 * to touch later.
 *
 * Model access goes through the Vercel AI Gateway: one API key
 * (AI_GATEWAY_API_KEY, set server-side only — see .env.example) unlocks
 * models from every major provider via a "provider/model" string. Swapping
 * models, or even providers, is a one-line change here and nowhere else.
 * Full catalog: https://vercel.com/ai-gateway/models
 */

export const CHAT_MODEL = "anthropic/claude-sonnet-5";

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
