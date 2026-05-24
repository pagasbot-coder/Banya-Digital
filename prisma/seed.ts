import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

/**
 * Optional dev seed stub — extend when demo data is needed.
 * Run: npx prisma db seed
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.info("Seed skipped: set DATABASE_URL in .env");
    return;
  }

  const pool = new Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const hallCount = await prisma.hall.count();
    if (hallCount === 0) {
      console.info("Seed stub: no halls yet — add demo data in a follow-up task.");
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
