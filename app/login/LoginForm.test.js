import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
    it("renders labeled email and password fields", () => {
        render(<LoginForm />);

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    });

    it("shows validation errors when submitted empty", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(await screen.findByText("Enter your email.")).toBeInTheDocument();
        expect(
            screen.getByText("Password must be at least 8 characters."),
        ).toBeInTheDocument();
    });

    it("shows an error for an invalid email format only", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.type(screen.getByLabelText("Email"), "not-an-email");
        await user.type(screen.getByLabelText("Password"), "longenoughpassword");
        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(
            await screen.findByText("Enter a valid email address."),
        ).toBeInTheDocument();
        expect(
            screen.queryByText("Password must be at least 8 characters."),
        ).not.toBeInTheDocument();
    });

    it("submits valid data and shows a confirmation", async () => {
        const user = userEvent.setup();
        const handleSubmit = vi.fn();
        render(<LoginForm onSubmit={handleSubmit} />);

        await user.type(screen.getByLabelText("Email"), "shopper@example.com");
        await user.type(screen.getByLabelText("Password"), "longenoughpassword");
        await user.click(screen.getByRole("button", { name: "Log in" }));

        expect(handleSubmit).toHaveBeenCalledWith({
            email: "shopper@example.com",
            password: "longenoughpassword",
        });
        expect(await screen.findByRole("status")).toHaveTextContent(
            "Looks good",
        );
    });
});