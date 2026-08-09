import Chat from "./Chat";

export const metadata = {
  title: "AI Shopping Assistant — ShopFront",
  description:
    "Ask ShopFront's assistant about sizing, categories, and finding the right product.",
};

export default function AssistantPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-teal">
        AI Assistant
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink">
        Ask the shopping assistant
      </h1>
      <p className="mt-2 max-w-prose text-sm text-ink/60">
        Streams a real response back token by token — try stopping it
        mid-reply, and sending a follow-up in the same conversation.
      </p>

      <div className="mt-8">
        <Chat />
      </div>
    </main>
  );
}
