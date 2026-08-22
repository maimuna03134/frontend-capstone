import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
    plugins: [react({ include: /\.[jt]sx?$/ })],
    esbuild: {
        loader: "jsx",
        include: /\.jsx?($|\?)/,
        exclude: /node_modules/,
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                ".js": "jsx",
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.js"],
        exclude: ["node_modules", "e2e", ".next"],
        pool: "threads",
    },
});