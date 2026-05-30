/** Smoke: CRM guest + FIFO OUT server actions (T-035). */
import { config } from "dotenv";
config();

const { createGuest } = await import("../modules/crm/actions/crm-actions.ts");
const { initialCrmActionState } = await import(
  "../modules/crm/actions/crm-action-state.ts"
);
const { performFifoOut } = await import(
  "../modules/operations/inventory/actions/fifo-out-action.ts"
);
const { initialFifoActionState } = await import(
  "../modules/operations/inventory/actions/fifo-action-state.ts"
);
const { prisma } = await import("../lib/db/index.ts");

try {
  const guestFd = new FormData();
  guestFd.set("fullName", `QA T-035 ${Date.now()}`);
  guestFd.set("phone", "+79001234567");
  guestFd.set("segment", "VIP");

  const guestResult = await createGuest(initialCrmActionState, guestFd);
  console.log("createGuest:", guestResult);

  const item = await prisma.inventoryItem.findFirst({
    where: { lots: { some: { quantityLeft: { gt: 0 } } } },
    include: { lots: { where: { quantityLeft: { gt: 0 } }, take: 1 } },
  });
  if (!item) {
    console.error("No inventory item with stock");
    process.exit(1);
  }

  const fifoFd = new FormData();
  fifoFd.set("itemId", item.id);
  fifoFd.set("quantity", "0.1");

  const fifoResult = await performFifoOut(initialFifoActionState, fifoFd);
  console.log("performFifoOut:", fifoResult);
} catch (e) {
  console.error("FATAL", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
