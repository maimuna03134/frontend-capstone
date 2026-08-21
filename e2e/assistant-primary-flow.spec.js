import { test, expect } from "@playwright/test";

// A hand-built (but protocol-accurate) AI SDK UI Message Stream response —
// see https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol. Server-Sent
// Events, one JSON object per "data:" line, terminated by "data: [DONE]".
// This is the same reason the brief says to mock the AI route: the E2E
// run should never depend on a real model call.
function mockAssistantReply(text) {
    const events = [
        { type: "start" },
        { type: "start-step" },
        { type: "text-start", id: "0" },
        { type: "text-delta", id: "0", delta: text },
        { type: "text-end", id: "0" },
        { type: "finish-step" },
        { type: "finish" },
    ];
    const body =
        events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("") +
        "data: [DONE]\n\n";

    return {
        status: 200,
        headers: {
            "content-type": "text/event-stream",
            "x-vercel-ai-ui-message-stream": "v1",
        },
        body,
    };
}

test("primary flow: ask the assistant a question and get a reply", async ({
    page,
}) => {
    await page.route("**/api/chat", async (route) => {
        await route.fulfill(
            mockAssistantReply(
                "We carry warm sweaters and jackets under $50 in the clothing category.",
            ),
        );
    });

    await page.goto("/assistant");

    const suggestion = page.getByRole("button", {
        name: "I need something warm for winter under $50",
    });
    await expect(suggestion).toBeVisible();
    await suggestion.click();

    // User message appears immediately (optimistic UI), and the composer
    // clears for the next message.
    await expect(
        page.getByText("I need something warm for winter under $50"),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Ask the assistant...")).toHaveValue("");

    // Mocked assistant reply renders once the (fake) stream completes.
    await expect(
        page.getByText(
            "We carry warm sweaters and jackets under $50 in the clothing category.",
        ),
    ).toBeVisible();

    // Composer is usable again — no crash, no stuck loading state.
    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
});