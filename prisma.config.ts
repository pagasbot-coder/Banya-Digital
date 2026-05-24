import "dotenv/config";
import { defineConfig } from "prisma/config";

/** CLI config (Prisma 7): migrations, seed, DATABASE_URL. */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Fallback lets `prisma generate` run before .env exists; set real URL for db push/migrate.
    url:
      process.env.DATABASE_URL ??
      "postgresql://banya:banya@localhost:5432/banya_digital?schema=public",
  },
});
