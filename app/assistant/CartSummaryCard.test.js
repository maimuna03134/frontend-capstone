import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartSummaryCard } from "./Chat";

const baseSummary = {
    items: [
        { name: "t-shirt", quantity: 2, unitPrice: 15, lineTotal: 30 },
        { name: "jacket", quantity: 1, unitPrice: 60, lineTotal: 60 },
    ],
    subtotal: 90,
    tax: 7.2,
    total: 97.2,
    currency: "USD",
};

describe("CartSummaryCard", () => {
    it("renders each line item and the totals", () => {
        render(<CartSummaryCard summary={{ ...baseSummary, shipping: 0 }} />);

        expect(screen.getByText("2 × t-shirt")).toBeInTheDocument();
        expect(screen.getByText("1 × jacket")).toBeInTheDocument();
        expect(screen.getByText("$30.00")).toBeInTheDocument();
        expect(screen.getByText("$60.00")).toBeInTheDocument();
        expect(screen.getByText("$90.00")).toBeInTheDocument();
        expect(screen.getByText("$7.20")).toBeInTheDocument();
        expect(screen.getByText("$97.20")).toBeInTheDocument();
    });

    it("shows Free when shipping is zero", () => {
        render(<CartSummaryCard summary={{ ...baseSummary, shipping: 0 }} />);

        expect(screen.getByText("Free")).toBeInTheDocument();
    });

    it("shows a dollar amount when shipping is non-zero", () => {
        render(<CartSummaryCard summary={{ ...baseSummary, shipping: 5 }} />);

        expect(screen.getByText("$5.00")).toBeInTheDocument();
        expect(screen.queryByText("Free")).not.toBeInTheDocument();
    });

    it("renders nothing when no summary is provided", () => {
        const { container } = render(<CartSummaryCard summary={null} />);

        expect(container).toBeEmptyDOMElement();
    });
});