import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Neon round-trips exceed Vitest's 5s default under load.
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false
  }
});

