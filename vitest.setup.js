import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
    cleanup();
});

// jsdom doesn't implement these — Chat.js calls both, so every test that
// renders it needs them polyfilled before the component ever mounts.
window.matchMedia =
    window.matchMedia ||
    function matchMedia(query) {
        return {
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        };
    };

Element.prototype.scrollIntoView = vi.fn();