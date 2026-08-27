// A single serverless instance's in-memory rate limiter. Honest tradeoff
// (documented in README): this resets on cold start and doesn't share
// state across concurrent instances, so it's not a real distributed rate
// limiter — but it's zero-dependency and stops the common case (one
// script hammering the endpoint from one IP), which is the actual threat
// model for a capstone project with no paid infra behind it.

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map(); // ip -> timestamps[]

export function isRateLimited(ip) {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > MAX_REQUESTS_PER_WINDOW;
}

export function getClientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") ?? "unknown";
}