import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useChat } from "@ai-sdk/react";
import Chat from "./Chat";

// Never call the real AI route: useChat is mocked entirely, and each test
// controls exactly the { messages, status, error } shape it needs.
vi.mock("@ai-sdk/react", () => ({
    useChat: vi.fn(),
}));

function textMessage(id, role, text) {
    return { id, role, parts: [{ type: "text", text }] };
}

function toolMessage(id, state, extra = {}) {
    return {
        id,
        role: "assistant",
        parts: [
            {
                type: "tool-calculateCartSummary",
                toolCallId: id,
                state,
                ...extra,
            },
        ],
    };
}

function mockUseChat(overrides = {}) {
    const defaults = {
        messages: [],
        sendMessage: vi.fn(),
        status: "ready",
        stop: vi.fn(),
        error: undefined,
        regenerate: vi.fn(),
    };
    const value = { ...defaults, ...overrides };
    useChat.mockReturnValue(value);
    return value;
}

describe("Chat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows suggested prompts as an onboarding empty state with no messages", () => {
        mockUseChat({ messages: [] });
        render(<Chat />);

        expect(
            screen.getByRole("button", {
                name: "I need something warm for winter under $50",
            }),
        ).toBeInTheDocument();
    });

    it("sends a suggested prompt when clicked", async () => {
        const user = userEvent.setup();
        const { sendMessage } = mockUseChat({ messages: [] });
        render(<Chat />);

        await user.click(
            screen.getByRole("button", {
                name: "I need something warm for winter under $50",
            }),
        );

        expect(sendMessage).toHaveBeenCalledWith({
            text: "I need something warm for winter under $50",
        });
    });

    it("renders user and assistant text messages", () => {
        mockUseChat({
            messages: [
                textMessage("1", "user", "What's warm for winter?"),
                textMessage("2", "assistant", "Try our sweaters and hoodies."),
            ],
        });
        render(<Chat />);

        expect(screen.getByText("What's warm for winter?")).toBeInTheDocument();
        expect(
            screen.getByText("Try our sweaters and hoodies."),
        ).toBeInTheDocument();
    });

    it("shows a pending indicator while waiting for the first token", () => {
        mockUseChat({
            messages: [textMessage("1", "user", "Hi")],
            status: "submitted",
        });
        render(<Chat />);

        expect(
            screen.getByRole("status", { name: "Assistant is responding" }),
        ).toBeInTheDocument();
    });

    it("shows a categorized error banner with a working retry button", async () => {
        const user = userEvent.setup();
        const { regenerate } = mockUseChat({
            messages: [textMessage("1", "user", "Hi")],
            status: "error",
            error: new Error("network"),
        });
        render(<Chat />);

        expect(
            screen.getByText(
                "Couldn't reach the assistant. Check your connection and try again.",
            ),
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Retry last message" }),
        );
        expect(regenerate).toHaveBeenCalled();
    });

    it("renders the tool part while the model is streaming its input", () => {
        mockUseChat({
            messages: [toolMessage("t1", "input-streaming")],
        });
        render(<Chat />);

        expect(screen.getByText("Reading the order...")).toBeInTheDocument();
    });

    it("renders the tool part with parsed items once input is available", () => {
        mockUseChat({
            messages: [
                toolMessage("t2", "input-available", {
                    input: { items: [{ name: "jacket", quantity: 1 }] },
                }),
            ],
        });
        render(<Chat />);

        expect(screen.getByText("Calculating totals...")).toBeInTheDocument();
        expect(screen.getByText("1× jacket")).toBeInTheDocument();
    });

    it("renders the order summary card once the tool output is available", () => {
        mockUseChat({
            messages: [
                toolMessage("t3", "output-available", {
                    output: {
                        items: [{ name: "jacket", quantity: 1, lineTotal: 60 }],
                        subtotal: 60,
                        tax: 4.8,
                        shipping: 0,
                        total: 64.8,
                        currency: "USD",
                    },
                }),
            ],
        });
        render(<Chat />);

        expect(screen.getByText("Order summary")).toBeInTheDocument();
        expect(screen.getByText("$64.80")).toBeInTheDocument();
    });

    it("renders a designed error card when the tool call fails", () => {
        mockUseChat({
            messages: [
                toolMessage("t4", "output-error", {
                    errorText: '"T-shirt" requests 50 units, but only 20 are in stock per order.',
                }),
            ],
        });
        render(<Chat />);

        expect(screen.getByText("Couldn't calculate the total")).toBeInTheDocument();
        expect(
            screen.getByText(
                '"T-shirt" requests 50 units, but only 20 are in stock per order.',
            ),
        ).toBeInTheDocument();
    });
});