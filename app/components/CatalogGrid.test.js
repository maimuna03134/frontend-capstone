import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CatalogGrid from "./CatalogGrid";

// next/image relies on Next's build-time config injection, which isn't
// present under Vitest — swap it for a plain <img> for these tests.
vi.mock("next/image", () => ({
    default: (props) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img alt={props.alt} src={props.src} />;
    },
}));

vi.mock("sonner", () => ({
    toast: { success: vi.fn() },
}));

const PRODUCTS = [
    {
        id: 1,
        title: "Blue Jacket",
        category: "men's clothing",
        price: 60,
        image: "https://fakestoreapi.com/img/jacket.jpg",
        rating: { rate: 4.2, count: 10 },
    },
    {
        id: 2,
        title: "Gold Ring",
        category: "jewelery",
        price: 120,
        image: "https://fakestoreapi.com/img/ring.jpg",
        rating: { rate: 3.8, count: 5 },
    },
    {
        id: 3,
        title: "Red T-shirt",
        category: "men's clothing",
        price: 15,
        image: "https://fakestoreapi.com/img/tshirt.jpg",
        rating: { rate: 4.9, count: 20 },
    },
];
const CATEGORIES = ["jewelery", "men's clothing"];

describe("CatalogGrid", () => {
    it("renders every product by default", () => {
        render(<CatalogGrid products={PRODUCTS} categories={CATEGORIES} />);

        expect(screen.getByText("Blue Jacket")).toBeInTheDocument();
        expect(screen.getByText("Gold Ring")).toBeInTheDocument();
        expect(screen.getByText("Red T-shirt")).toBeInTheDocument();
        expect(screen.getByText("3 products")).toBeInTheDocument();
    });

    it("filters by search text", async () => {
        const user = userEvent.setup();
        render(<CatalogGrid products={PRODUCTS} categories={CATEGORIES} />);

        await user.type(screen.getByLabelText("Search products"), "jacket");

        expect(screen.getByText("Blue Jacket")).toBeInTheDocument();
        expect(screen.queryByText("Gold Ring")).not.toBeInTheDocument();
        expect(screen.getByText("1 product")).toBeInTheDocument();
    });

    it("filters by category", async () => {
        const user = userEvent.setup();
        render(<CatalogGrid products={PRODUCTS} categories={CATEGORIES} />);

        await user.selectOptions(
            screen.getByLabelText("Filter by category"),
            "jewelery",
        );

        expect(screen.getByText("Gold Ring")).toBeInTheDocument();
        expect(screen.queryByText("Blue Jacket")).not.toBeInTheDocument();
    });

    it("sorts by price ascending", async () => {
        const user = userEvent.setup();
        render(<CatalogGrid products={PRODUCTS} categories={CATEGORIES} />);

        await user.selectOptions(
            screen.getByLabelText("Sort by"),
            "price-asc",
        );

        const titles = screen
            .getAllByRole("heading", { level: 3 })
            .map((el) => el.textContent);
        expect(titles).toEqual(["Red T-shirt", "Blue Jacket", "Gold Ring"]);
    });

    it("shows an empty state with a working clear-filters action", async () => {
        const user = userEvent.setup();
        render(<CatalogGrid products={PRODUCTS} categories={CATEGORIES} />);

        await user.type(screen.getByLabelText("Search products"), "nonexistent");
        expect(
            screen.getByText(/No products match your filters/),
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Clear filters" }));
        expect(screen.getByText("Blue Jacket")).toBeInTheDocument();
    });
});