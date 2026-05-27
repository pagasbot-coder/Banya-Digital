/**
 * Urban SPA seed preset (T-020): термы/бассейн/хамам/VIP без органики и kitchen conflict.
 * Запуск: SEED_PRESET=urban-spa npm run db:seed
 */
import {
  BookingStatus,
  CostType,
  HallZoneType,
  KitchenSyncStatus,
  PrismaClient,
  ServiceKind,
  ShiftType,
} from "@prisma/client";
import {
  addDays,
  atBusinessTime,
  startOfDay,
  startOfWeek,
} from "../lib/date-utils";

const atTime = atBusinessTime;

/** Демо urban SPA: 4 зоны, акцент на PRODUCT и процедуры. */
export async function seedUrbanSpa(prisma: PrismaClient) {
  const today = startOfDay();
  const yesterday = addDays(today, -1);

  const [thermalHall, poolHall, hamHall, vipHall] = await Promise.all([
    prisma.hall.create({
      data: {
        code: "THM",
        name: "Термы",
        capacity: 40,
        zoneType: HallZoneType.THERMAL,
        tags: ["urban-spa", "white-label"],
      },
    }),
    prisma.hall.create({
      data: {
        code: "POL",
        name: "Бассейн",
        capacity: 24,
        zoneType: HallZoneType.POOL,
        tags: ["urban-spa"],
      },
    }),
    prisma.hall.create({
      data: {
        code: "HAM",
        name: "Хамам",
        capacity: 12,
        zoneType: HallZoneType.HAMMAM,
        tags: ["urban-spa"],
      },
    }),
    prisma.hall.create({
      data: {
        code: "PRV",
        name: "Private Suite",
        capacity: 4,
        zoneType: HallZoneType.VIP_SUITE,
        tags: ["urban-spa", "corporate"],
      },
    }),
  ]);

  const halls = [thermalHall, poolHall, hamHall, vipHall] as const;

  const [thermalPass, poolDay, hamRitual, vipSuite] = await Promise.all([
    prisma.service.create({
      data: {
        code: "THM-DAY",
        name: "Дневной доступ в термы",
        hallId: thermalHall.id,
        kind: ServiceKind.SERVICE,
        basePrice: 4500,
      },
    }),
    prisma.service.create({
      data: {
        code: "POL-2H",
        name: "Бассейн 2 часа",
        hallId: poolHall.id,
        kind: ServiceKind.SERVICE,
        basePrice: 3200,
      },
    }),
    prisma.service.create({
      data: {
        code: "HAM-SCR",
        name: "Хамам + скраб",
        hallId: hamHall.id,
        kind: ServiceKind.SERVICE,
        basePrice: 7800,
      },
    }),
    prisma.service.create({
      data: {
        code: "PRV-4H",
        name: "Private Suite 4 ч",
        hallId: vipHall.id,
        kind: ServiceKind.SERVICE,
        basePrice: 22000,
      },
    }),
  ]);

  const retailSpa = await prisma.service.create({
    data: {
      code: "RTL-COS",
      name: "Косметика и аксессуары",
      kind: ServiceKind.PRODUCT,
      basePrice: 1200,
    },
  });

  // ─── Retail products + sales (T-021) ─────────────────────────────────────
  const [cream, water] = await Promise.all([
    prisma.retailProduct.create({
      data: {
        name: "Крем для тела (розница)",
        category: "Косметика",
        unit: "шт",
        price: 1490,
        cogsPerUnit: 720,
      },
    }),
    prisma.retailProduct.create({
      data: {
        name: "Вода 0,5 л (розница)",
        category: "Бар",
        unit: "шт",
        price: 190,
        cogsPerUnit: 55,
      },
    }),
  ]);

  await prisma.retailSale.createMany({
    data: [
      { productId: cream.id, quantity: 2, soldAt: atTime(today, 16, 10), hallId: vipHall.id },
      { productId: water.id, quantity: 12, soldAt: atTime(today, 13, 5), hallId: poolHall.id },
      { productId: water.id, quantity: 9, soldAt: atTime(yesterday, 18, 35) },
    ],
  });

  const [relaxProgram, aquaProgram] = await Promise.all([
    prisma.spaProgram.create({
      data: {
        code: "RELAX-URB",
        name: "Urban Relax",
        description: "Термы + бассейн, 2,5 ч",
        durationMinutes: 150,
      },
    }),
    prisma.spaProgram.create({
      data: {
        code: "AQUA-FLOW",
        name: "Aqua Flow",
        description: "Бассейн + лёгкий массаж",
        durationMinutes: 120,
      },
    }),
  ]);

  const guests = await Promise.all([
    prisma.guest.create({
      data: { fullName: "Ольга Смирнова", phone: "+7 916 111-22-33" },
    }),
    prisma.guest.create({
      data: { fullName: "Кирилл Новиков", phone: "+7 903 222-33-44" },
    }),
    prisma.guest.create({
      data: { fullName: "Наталья Орлова", phone: "+7 925 333-44-55" },
    }),
    prisma.guest.create({
      data: { fullName: "Артём Лебедев", phone: "+7 977 444-55-66" },
    }),
  ]);

  const todayBookings = await Promise.all([
    prisma.booking.create({
      data: {
        guestId: guests[0].id,
        hallId: thermalHall.id,
        serviceId: thermalPass.id,
        spaProgramId: relaxProgram.id,
        status: BookingStatus.CHECKED_IN,
        startsAt: atTime(today, 10, 0),
        endsAt: atTime(today, 13, 0),
        partySize: 6,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[1].id,
        hallId: poolHall.id,
        serviceId: poolDay.id,
        spaProgramId: aquaProgram.id,
        status: BookingStatus.CONFIRMED,
        startsAt: atTime(today, 12, 0),
        endsAt: atTime(today, 14, 0),
        partySize: 8,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[2].id,
        hallId: hamHall.id,
        serviceId: hamRitual.id,
        status: BookingStatus.CONFIRMED,
        startsAt: atTime(today, 15, 0),
        endsAt: atTime(today, 17, 0),
        partySize: 4,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[3].id,
        hallId: vipHall.id,
        serviceId: vipSuite.id,
        status: BookingStatus.CONFIRMED,
        startsAt: atTime(today, 14, 0),
        endsAt: atTime(today, 18, 0),
        partySize: 2,
      },
    }),
  ]);

  const relaxTiming = await prisma.programTiming.create({
    data: {
      spaProgramId: relaxProgram.id,
      bookingId: todayBookings[0].id,
      hallId: thermalHall.id,
      startsAt: atTime(today, 10, 0),
      endsAt: atTime(today, 13, 0),
      staffLabel: "Хостес зоны",
    },
  });

  await prisma.kitchenSlot.create({
    data: {
      programTimingId: relaxTiming.id,
      startsAt: atTime(today, 11, 30),
      endsAt: atTime(today, 12, 0),
      station: "Лобби-бар",
      syncStatus: KitchenSyncStatus.CONFIRMED,
    },
  });

  await Promise.all([
    prisma.revenueLine.create({
      data: {
        hallId: thermalHall.id,
        serviceId: thermalPass.id,
        amount: 54000,
        businessDate: today,
        description: "Термы — дневной поток",
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: poolHall.id,
        serviceId: poolDay.id,
        amount: 25600,
        businessDate: today,
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: hamHall.id,
        serviceId: hamRitual.id,
        amount: 31200,
        businessDate: today,
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: vipHall.id,
        serviceId: vipSuite.id,
        amount: 44000,
        businessDate: today,
      },
    }),
    prisma.revenueLine.create({
      data: {
        serviceId: retailSpa.id,
        amount: 18600,
        businessDate: today,
        description: "Розница косметики",
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: thermalHall.id,
        serviceId: thermalPass.id,
        amount: 42000,
        businessDate: yesterday,
      },
    }),
  ]);

  await Promise.all([
    prisma.costLine.create({
      data: {
        hallId: thermalHall.id,
        amount: 12000,
        costType: CostType.OVERHEAD,
        businessDate: today,
        description: "Коммунальные термы",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: poolHall.id,
        amount: 8400,
        costType: CostType.LABOR,
        businessDate: today,
      },
    }),
    prisma.costLine.create({
      data: {
        serviceId: retailSpa.id,
        amount: 11200,
        costType: CostType.COGS,
        businessDate: today,
        description: "COGS розница",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: hamHall.id,
        serviceId: hamRitual.id,
        amount: 9800,
        costType: CostType.COGS,
        businessDate: today,
      },
    }),
  ]);

  const weekStart = startOfWeek(today);
  const tomorrow = addDays(today, 1);
  const weekFact = await prisma.revenueLine.aggregate({
    where: { businessDate: { gte: weekStart, lt: tomorrow } },
    _sum: { amount: true },
  });
  await prisma.revenueWeekPlan.upsert({
    where: { weekStart },
    update: {
      amount: Math.round(Number(weekFact._sum.amount ?? 0) * 0.92),
      notes: "Urban SPA — план недели (~92% факта)",
    },
    create: {
      weekStart,
      amount: Math.round(Number(weekFact._sum.amount ?? 0) * 0.92),
      notes: "Urban SPA — план недели",
    },
  });

  await Promise.all([
    prisma.shiftChecklist.create({
      data: {
        hallId: thermalHall.id,
        shiftDate: today,
        shiftType: ShiftType.DAY,
        title: "Открытие — Термы",
        items: {
          create: [
            { sortOrder: 1, label: "Температура воды и паровых зон" },
            { sortOrder: 2, label: "Чистота раздевалок" },
          ],
        },
      },
    }),
    prisma.shiftChecklist.create({
      data: {
        hallId: poolHall.id,
        shiftDate: today,
        shiftType: ShiftType.DAY,
        title: "Бассейн — хлор/pH",
        items: {
          create: [{ sortOrder: 1, label: "Замер pH и свободного хлора" }],
        },
      },
    }),
  ]);

  // FIFO пустой — urban SPA без органики (см. QA сценарий urban)
  void halls;
}
