import LoginForm from "./LoginForm";


export const metadata = {
    title: "Log in — ShopFront",
    description: "Sign in to ShopFront.",
};

export default function LoginPage() {
    return (
        <main className="mx-auto max-w-sm px-4 py-16">
            <p className="font-mono text-xs uppercase tracking-wide text-teal">
                Account
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink">Log in</h1>
            <p className="mt-2 text-sm text-ink/60">
                Client-side validation only for now — real authentication is a
                later assignment.
            </p>

            <div className="mt-8">
                <LoginForm />
            </div>
        </main>
    );
}