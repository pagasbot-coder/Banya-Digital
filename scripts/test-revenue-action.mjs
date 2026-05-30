import { config } from "dotenv";
config();

const { createRevenueLine, initialFinanceActionState } = await import(
  "../modules/finance/actions/create-finance-lines.ts"
);
const { getFinanceData } = await import(
  "../modules/finance/services/get-finance-data.ts"
);
const { getWeekPlanFact } = await import(
  "../modules/finance/services/get-week-plan-fact.ts"
);
const { prisma } = await import("../lib/db/index.ts");

try {
  const halls = await prisma.hall.findMany({ take: 1 });
  const services = await prisma.service.findMany({ take: 1 });
  console.log("hall:", halls[0]?.id, halls[0]?.name);
  console.log("service:", services[0]?.id, services[0]?.name);

  if (!halls[0]) {
    console.error("No halls in DB");
    process.exit(1);
  }

  const fd = new FormData();
  fd.set("hallId", halls[0].id);
  if (services[0]) fd.set("serviceId", services[0].id);
  fd.set("amount", "12345");
  fd.set(
    "businessDate",
    new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Moscow" })
  );

  const result = await createRevenueLine(initialFinanceActionState, fd);
  console.log("action result:", result);

  const [data, week] = await Promise.all([getFinanceData(), getWeekPlanFact()]);
  console.log("finance kind:", data.kind);
  if (data.kind === "data") {
    console.log("overall revenue:", data.overallTotals.revenue);
  } else {
    console.log("empty message:", data.message);
  }
  console.log("week plan fact:", week ? "ok" : "null");
} catch (e) {
  console.error("FATAL", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
