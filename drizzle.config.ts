import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: "./lib/db/schema.ts",
    dialect: 'postgresql',
    out: './drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL || '',
    },
    verbose: true,
    strict: true,
})
