import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { isRateLimited, getClientIp } from "./rate-limit";

describe("isRateLimited", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("allows requests under the limit", () => {
        const ip = "1.1.1.1";
        for (let i = 0; i < 20; i++) {
            expect(isRateLimited(ip)).toBe(false);
        }
    });

    it("blocks the request once the window's limit is exceeded", () => {
        const ip = "2.2.2.2";
        for (let i = 0; i < 20; i++) {
            isRateLimited(ip);
        }
        expect(isRateLimited(ip)).toBe(true);
    });

    it("resets once the window has passed", () => {
        const ip = "3.3.3.3";
        for (let i = 0; i < 20; i++) {
            isRateLimited(ip);
        }
        expect(isRateLimited(ip)).toBe(true);

        vi.advanceTimersByTime(11 * 60 * 1000);

        expect(isRateLimited(ip)).toBe(false);
    });

    it("tracks separate IPs independently", () => {
        const busyIp = "4.4.4.4";
        for (let i = 0; i < 21; i++) {
            isRateLimited(busyIp);
        }
        expect(isRateLimited(busyIp)).toBe(true);
        expect(isRateLimited("5.5.5.5")).toBe(false);
    });
});

describe("getClientIp", () => {
    it("reads the first IP from x-forwarded-for", () => {
        const req = {
            headers: new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" }),
        };
        expect(getClientIp(req)).toBe("9.9.9.9");
    });

    it("falls back to x-real-ip", () => {
        const req = { headers: new Headers({ "x-real-ip": "8.8.8.8" }) };
        expect(getClientIp(req)).toBe("8.8.8.8");
    });

    it("falls back to unknown when neither header is present", () => {
        const req = { headers: new Headers() };
        expect(getClientIp(req)).toBe("unknown");
    });
});