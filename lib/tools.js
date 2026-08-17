import { z } from "zod";

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING_FEE = 5;
const MAX_QUANTITY_PER_ITEM = 20;

export const calculateCartSummary = {
    description:
        "Calculate an order summary (subtotal, tax, shipping, total) for items the shopper wants. Call this when the shopper lists specific items with quantities and prices and asks for a total, checkout estimate, or cart summary.",
    inputSchema: z.object({
        items: z
            .array(
                z.object({
                    name: z.string().describe("Product name as the shopper described it"),
                    quantity: z.number().int().positive().describe("How many units"),
                    unitPrice: z.number().positive().describe("Price per unit in USD"),
                }),
            )
            .min(1)
            .describe("Every distinct item in the order"),
    }),
    execute: async ({ items }) => {
        const overStock = items.find((item) => item.quantity > MAX_QUANTITY_PER_ITEM);
        if (overStock) {
            throw new Error(
                `"${overStock.name}" requests ${overStock.quantity} units, but only ${MAX_QUANTITY_PER_ITEM} are in stock per order.`,
            );
        }

        const lineItems = items.map((item) => ({
            ...item,
            lineTotal: Number((item.quantity * item.unitPrice).toFixed(2)),
        }));
        const subtotal = Number(
            lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2),
        );
        const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
        const tax = Number((subtotal * TAX_RATE).toFixed(2));
        const total = Number((subtotal + tax + shipping).toFixed(2));

        return { items: lineItems, subtotal, tax, shipping, total, currency: "USD" };
    },
};