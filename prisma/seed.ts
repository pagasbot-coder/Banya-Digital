import { PrismaPg } from "@prisma/adapter-pg";
import {
  BookingStatus,
  CostType,
  KitchenSyncStatus,
  PrismaClient,
  ServiceKind,
  ShiftType,
  StockMovementType,
} from "@prisma/client";
import { Pool } from "pg";

/** Начало календарного дня (локальное время сервера seed). */
function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function atTime(base: Date, hours: number, minutes = 0): Date {
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

/** Очистка demo-данных перед повторным seed (FK-safe порядок). */
async function clearDemoData(prisma: PrismaClient) {
  await prisma.stockMovement.deleteMany();
  await prisma.costLine.deleteMany();
  await prisma.revenueLine.deleteMany();
  await prisma.kitchenSlot.deleteMany();
  await prisma.programTiming.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.shiftChecklist.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.spaProgram.deleteMany();
  await prisma.inventoryLot.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.service.deleteMany();
  await prisma.hall.deleteMany();
}

/**
 * Rich demo seed for premium banya ERP — halls, bookings, FIFO inventory, finance KPIs.
 * Run: npm run db:push && npm run db:seed
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
    await clearDemoData(prisma);

    const today = startOfDay();
    const yesterday = addDays(today, -1);

    // ─── Залы ───────────────────────────────────────────────────────────────
    const [parHall, vipHall, senHall, hamHall] = await Promise.all([
      prisma.hall.create({
        data: { code: "PAR", name: "Парная", capacity: 12 },
      }),
      prisma.hall.create({
        data: { code: "VIP", name: "VIP", capacity: 6 },
      }),
      prisma.hall.create({
        data: { code: "SEN", name: "Сеновал", capacity: 8 },
      }),
      prisma.hall.create({
        data: { code: "HAM", name: "Хамам", capacity: 10 },
      }),
    ]);

  // ─── Услуги ───────────────────────────────────────────────────────────────
  const [parSession, vipRitual, senHay, hamSteam] = await Promise.all([
    prisma.service.create({
      data: {
        code: "PAR-STD",
        name: "Классический пар",
        hallId: parHall.id,
        kind: ServiceKind.SERVICE,
        basePrice: 8500,
      },
    }),
    prisma.service.create({
      data: {
        code: "VIP-RIT",
        name: "VIP-ритуал «Император»",
        hallId: vipHall.id,
        kind: ServiceKind.SERVICE,
        basePrice: 28000,
      },
    }),
    prisma.service.create({
      data: {
        code: "SEN-HAY",
        name: "Сеновал с травяным паром",
        hallId: senHall.id,
        kind: ServiceKind.SERVICE,
        basePrice: 12000,
      },
    }),
    prisma.service.create({
      data: {
        code: "HAM-STEAM",
        name: "Хамам + пилинг",
        hallId: hamHall.id,
        kind: ServiceKind.SERVICE,
        basePrice: 9500,
      },
    }),
  ]);

  const barHerb = await prisma.service.create({
    data: {
      code: "BAR-HERB",
      name: "Травяной чай премиум",
      kind: ServiceKind.PRODUCT,
      basePrice: 650,
    },
  });

  // ─── Spa-программы ────────────────────────────────────────────────────────
  const [detoxProgram, imperialProgram, relaxProgram] = await Promise.all([
    prisma.spaProgram.create({
      data: {
        code: "DETOX-WE",
        name: "Детокс выходного",
        description: "Пар + скраб + травяной чай, 3 ч",
        durationMinutes: 180,
      },
    }),
    prisma.spaProgram.create({
      data: {
        code: "IMPERIAL",
        name: "Императорский ритуал",
        description: "VIP-программа с массажем и банными процедурами",
        durationMinutes: 240,
      },
    }),
    prisma.spaProgram.create({
      data: {
        code: "RELAX-EV",
        name: "Вечерний релакс",
        description: "Хамам + аромапар",
        durationMinutes: 150,
      },
    }),
  ]);

  // ─── Гости ────────────────────────────────────────────────────────────────
  const guests = await Promise.all([
    prisma.guest.create({
      data: {
        fullName: "Алексей Воронов",
        phone: "+7 916 123-45-67",
        notes: "Постоянный гость, предпочитает VIP",
      },
    }),
    prisma.guest.create({
      data: {
        fullName: "Мария Козлова",
        phone: "+7 903 234-56-78",
      },
    }),
    prisma.guest.create({
      data: {
        fullName: "Дмитрий Соколов",
        phone: "+7 925 345-67-89",
      },
    }),
    prisma.guest.create({
      data: {
        fullName: "Елена Петрова",
        phone: "+7 977 456-78-90",
      },
    }),
    prisma.guest.create({
      data: {
        fullName: "Игорь Мельников",
        phone: "+7 915 567-89-01",
      },
    }),
    prisma.guest.create({
      data: {
        fullName: "Анна Белова",
        phone: "+7 926 678-90-12",
      },
    }),
  ]);

  // ─── Брони (сегодня + вчера для delta KPI) ───────────────────────────────
  const todayBookings = await Promise.all([
    prisma.booking.create({
      data: {
        guestId: guests[0].id,
        hallId: parHall.id,
        serviceId: parSession.id,
        spaProgramId: detoxProgram.id,
        status: BookingStatus.CHECKED_IN,
        startsAt: atTime(today, 10, 0),
        endsAt: atTime(today, 13, 0),
        partySize: 4,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[1].id,
        hallId: vipHall.id,
        serviceId: vipRitual.id,
        spaProgramId: imperialProgram.id,
        status: BookingStatus.CONFIRMED,
        startsAt: atTime(today, 14, 0),
        endsAt: atTime(today, 18, 0),
        partySize: 2,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[2].id,
        hallId: senHall.id,
        serviceId: senHay.id,
        status: BookingStatus.CONFIRMED,
        startsAt: atTime(today, 11, 30),
        endsAt: atTime(today, 14, 30),
        partySize: 3,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[3].id,
        hallId: hamHall.id,
        serviceId: hamSteam.id,
        spaProgramId: relaxProgram.id,
        status: BookingStatus.COMPLETED,
        startsAt: atTime(today, 9, 0),
        endsAt: atTime(today, 11, 30),
        partySize: 2,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[4].id,
        hallId: parHall.id,
        serviceId: parSession.id,
        status: BookingStatus.CONFIRMED,
        startsAt: atTime(today, 15, 0),
        endsAt: atTime(today, 17, 0),
        partySize: 6,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[5].id,
        hallId: vipHall.id,
        serviceId: vipRitual.id,
        status: BookingStatus.PENDING,
        startsAt: atTime(today, 19, 0),
        endsAt: atTime(today, 22, 0),
        partySize: 2,
      },
    }),
  ]);

  // Вчера — меньше загрузка для delta hall_load
  await Promise.all([
    prisma.booking.create({
      data: {
        guestId: guests[0].id,
        hallId: parHall.id,
        serviceId: parSession.id,
        status: BookingStatus.COMPLETED,
        startsAt: atTime(yesterday, 12, 0),
        endsAt: atTime(yesterday, 15, 0),
        partySize: 4,
      },
    }),
    prisma.booking.create({
      data: {
        guestId: guests[2].id,
        hallId: senHall.id,
        serviceId: senHay.id,
        status: BookingStatus.COMPLETED,
        startsAt: atTime(yesterday, 16, 0),
        endsAt: atTime(yesterday, 18, 0),
        partySize: 2,
      },
    }),
  ]);

  // ─── Program timings + kitchen slots (1 conflict для алертов) ─────────────
  const detoxTiming = await prisma.programTiming.create({
    data: {
      spaProgramId: detoxProgram.id,
      bookingId: todayBookings[0].id,
      hallId: parHall.id,
      startsAt: atTime(today, 10, 0),
      endsAt: atTime(today, 13, 0),
      staffLabel: "Пармастер Иван",
    },
  });

  const imperialTiming = await prisma.programTiming.create({
    data: {
      spaProgramId: imperialProgram.id,
      bookingId: todayBookings[1].id,
      hallId: vipHall.id,
      startsAt: atTime(today, 14, 0),
      endsAt: atTime(today, 18, 0),
      staffLabel: "SPA-мастер Ольга",
    },
  });

  // Конфликт: техBuild maintenance overlaps with program in Парная 14:00–16:00
  await prisma.programTiming.create({
    data: {
      spaProgramId: detoxProgram.id,
      hallId: parHall.id,
      startsAt: atTime(today, 14, 0),
      endsAt: atTime(today, 16, 0),
      staffLabel: "Техобслуживание",
      updatedAt: minutesAgo(12),
    },
  });

  await prisma.programTiming.create({
    data: {
      spaProgramId: relaxProgram.id,
      bookingId: todayBookings[3].id,
      hallId: hamHall.id,
      startsAt: atTime(today, 9, 0),
      endsAt: atTime(today, 11, 30),
      staffLabel: "Хамам-мастер Айгуль",
    },
  });

  await Promise.all([
    prisma.kitchenSlot.create({
      data: {
        programTimingId: detoxTiming.id,
        startsAt: atTime(today, 11, 30),
        endsAt: atTime(today, 12, 0),
        station: "Чайная",
        syncStatus: KitchenSyncStatus.CONFIRMED,
      },
    }),
    prisma.kitchenSlot.create({
      data: {
        programTimingId: imperialTiming.id,
        startsAt: atTime(today, 15, 30),
        endsAt: atTime(today, 16, 15),
        station: "Горячий цех",
        syncStatus: KitchenSyncStatus.IN_PROGRESS,
      },
    }),
    // Задержка кухни +15 мин для детокс
    prisma.kitchenSlot.create({
      data: {
        programTimingId: detoxTiming.id,
        startsAt: atTime(today, 12, 15),
        endsAt: atTime(today, 12, 45),
        station: "Лёгкие закуски",
        syncStatus: KitchenSyncStatus.CONFLICT,
        notes: "Задержка подачи +15 мин — очередь на гриле",
        updatedAt: minutesAgo(60),
      },
    }),
  ]);

  // ─── Inventory (сенo, пихта) + FIFO ───────────────────────────────────────
  const [hayItem, firItem] = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        sku: "ORG-HAY-01",
        name: "Сено луговое премиум",
        organicType: "HAY",
        unit: "kg",
        reorderLevel: 80,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "ORG-FIR-01",
        name: "Пихта премиум (ветки)",
        organicType: "FIR",
        unit: "kg",
        reorderLevel: 40,
      },
    }),
  ]);

  const hayLot1 = await prisma.inventoryLot.create({
    data: {
      itemId: hayItem.id,
      lotCode: "HAY-2026-03",
      receivedAt: addDays(today, -45),
      quantityIn: 120,
      quantityLeft: 95,
      unitCost: 85.5,
      expiresAt: addDays(today, 30),
    },
  });

  const hayLot2 = await prisma.inventoryLot.create({
    data: {
      itemId: hayItem.id,
      lotCode: "HAY-2026-04",
      receivedAt: addDays(today, -10),
      quantityIn: 100,
      quantityLeft: 88,
      unitCost: 92,
      expiresAt: addDays(today, 60),
    },
  });

  const firLot1 = await prisma.inventoryLot.create({
    data: {
      itemId: firItem.id,
      lotCode: "FIR-2026-02",
      receivedAt: addDays(today, -30),
      quantityIn: 60,
      quantityLeft: 18,
      unitCost: 210,
      expiresAt: addDays(today, 5),
    },
  });

  const firLot2 = await prisma.inventoryLot.create({
    data: {
      itemId: firItem.id,
      lotCode: "FIR-2026-03",
      receivedAt: addDays(today, -5),
      quantityIn: 50,
      quantityLeft: 47,
      unitCost: 225,
      expiresAt: addDays(today, 45),
    },
  });

  // FIFO movements: OUT from oldest lot first
  await Promise.all([
    prisma.stockMovement.create({
      data: {
        lotId: hayLot1.id,
        type: StockMovementType.OUT,
        quantity: 15,
        reference: "SEN-HAY-001",
        notes: "Сеновал, утренняя смена",
        occurredAt: atTime(today, 8, 0),
      },
    }),
    prisma.stockMovement.create({
      data: {
        lotId: hayLot1.id,
        type: StockMovementType.OUT,
        quantity: 10,
        reference: "SEN-HAY-002",
        notes: "Доп. подсыпка",
        occurredAt: atTime(today, 12, 0),
      },
    }),
    prisma.stockMovement.create({
      data: {
        lotId: firLot1.id,
        type: StockMovementType.OUT,
        quantity: 22,
        reference: "PAR-FIR-001",
        notes: "Парная, аромапар",
        occurredAt: atTime(today, 9, 30),
      },
    }),
    prisma.stockMovement.create({
      data: {
        lotId: firLot1.id,
        type: StockMovementType.OUT,
        quantity: 20,
        reference: "VIP-FIR-001",
        notes: "VIP зал",
        occurredAt: atTime(yesterday, 17, 0),
      },
    }),
    prisma.stockMovement.create({
      data: {
        lotId: hayLot2.id,
        type: StockMovementType.OUT,
        quantity: 12,
        reference: "SEN-HAY-003",
        notes: "Сеновал, вечерняя подсыпка (FIFO lot 2)",
        occurredAt: atTime(today, 16, 0),
      },
    }),
    prisma.stockMovement.create({
      data: {
        lotId: firLot2.id,
        type: StockMovementType.ADJUST,
        quantity: 3,
        reference: "ADJ-FIR",
        notes: "Коррекция после инвентаризации",
        occurredAt: atTime(today, 7, 0),
      },
    }),
  ]);

  // ─── Finance: revenue + COGS (today vs yesterday) ─────────────────────────
  await Promise.all([
    prisma.revenueLine.create({
      data: {
        hallId: parHall.id,
        serviceId: parSession.id,
        bookingId: todayBookings[0].id,
        amount: 34000,
        businessDate: today,
        description: "Детокс выходного — группа 4 чел.",
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: vipHall.id,
        serviceId: vipRitual.id,
        bookingId: todayBookings[1].id,
        amount: 56000,
        businessDate: today,
        description: "Императорский ритуал VIP",
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: senHall.id,
        serviceId: senHay.id,
        bookingId: todayBookings[2].id,
        amount: 36000,
        businessDate: today,
        description: "Сеновал с травяным паром",
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: hamHall.id,
        serviceId: hamSteam.id,
        bookingId: todayBookings[3].id,
        amount: 19000,
        businessDate: today,
        description: "Хамам + пилинг",
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: parHall.id,
        serviceId: parSession.id,
        amount: 51000,
        businessDate: today,
        description: "Классический пар — дневные сеансы",
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: parHall.id,
        serviceId: parSession.id,
        amount: 28000,
        businessDate: yesterday,
        description: "Вчера: парная",
      },
    }),
    prisma.revenueLine.create({
      data: {
        hallId: senHall.id,
        serviceId: senHay.id,
        amount: 24000,
        businessDate: yesterday,
        description: "Вчера: сеновал",
      },
    }),
  ]);

  await Promise.all([
    prisma.costLine.create({
      data: {
        hallId: senHall.id,
        lotId: hayLot1.id,
        amount: 2137.5,
        costType: CostType.COGS,
        businessDate: today,
        description: "Сено — расход FIFO",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: parHall.id,
        lotId: firLot1.id,
        amount: 4620,
        costType: CostType.COGS,
        businessDate: today,
        description: "Пихта — аромапар",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: vipHall.id,
        amount: 8400,
        costType: CostType.LABOR,
        businessDate: today,
        description: "SPA-мастер, смена",
      },
    }),
    prisma.costLine.create({
      data: {
        amount: 5200,
        costType: CostType.OVERHEAD,
        businessDate: today,
        description: "Коммунальные, пропорция дня",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: parHall.id,
        amount: 11200,
        costType: CostType.COGS,
        businessDate: yesterday,
        description: "Вчера: COGS парная",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: senHall.id,
        amount: 6800,
        costType: CostType.COGS,
        businessDate: yesterday,
        description: "Вчера: COGS сеновал",
      },
    }),
    // COGS по услугам за сегодня (для маржи по услугам)
    prisma.costLine.create({
      data: {
        hallId: parHall.id,
        serviceId: parSession.id,
        amount: 14200,
        costType: CostType.COGS,
        businessDate: today,
        description: "COGS — классический пар",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: vipHall.id,
        serviceId: vipRitual.id,
        amount: 11200,
        costType: CostType.LABOR,
        businessDate: today,
        description: "Мастера VIP-ритуала",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: senHall.id,
        serviceId: senHay.id,
        amount: 9800,
        costType: CostType.COGS,
        businessDate: today,
        description: "COGS — сеновал",
      },
    }),
    prisma.costLine.create({
      data: {
        hallId: hamHall.id,
        serviceId: hamSteam.id,
        amount: 15200,
        costType: CostType.COGS,
        businessDate: today,
        description: "COGS — хамам (низкая маржа)",
      },
    }),
    prisma.costLine.create({
      data: {
        serviceId: barHerb.id,
        amount: 4200,
        costType: CostType.COGS,
        businessDate: today,
        description: "Закупка трав и расходники бара",
      },
    }),
  ]);

  // Выручка бара (низкая маржа < 40%) + неделя/месяц
  const monthStart = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
  const extraRevenue = [
    prisma.revenueLine.create({
      data: {
        serviceId: barHerb.id,
        amount: 5200,
        businessDate: today,
        description: "Бар — травяные чаи",
      },
    }),
    ...Array.from({ length: 6 }, (_, i) => {
      const d = addDays(today, -(i + 1));
      return prisma.revenueLine.create({
        data: {
          hallId: i % 2 === 0 ? parHall.id : senHall.id,
          serviceId: i % 2 === 0 ? parSession.id : senHay.id,
          amount: 22000 + i * 1500,
          businessDate: d,
          description: `Выручка за ${d.toLocaleDateString("ru-RU")}`,
        },
      });
    }),
  ];

  for (let i = 0; i < 3; i++) {
    const d = addDays(monthStart, i * 5);
    if (d < today) {
      extraRevenue.push(
        prisma.revenueLine.create({
          data: {
            hallId: vipHall.id,
            serviceId: vipRitual.id,
            amount: 48000,
            businessDate: d,
            description: "VIP — ранний месяц",
          },
        })
      );
    }
  }

  await Promise.all(extraRevenue);

  // ─── Shift checklists ─────────────────────────────────────────────────────
  const [parChecklist, vipChecklist, senChecklist] = await Promise.all([
    prisma.shiftChecklist.create({
      data: {
        hallId: parHall.id,
        shiftDate: today,
        shiftType: ShiftType.DAY,
        title: "Открытие смены — Парная",
      },
    }),
    prisma.shiftChecklist.create({
      data: {
        hallId: vipHall.id,
        shiftDate: today,
        shiftType: ShiftType.DAY,
        title: "Открытие смены — VIP",
      },
    }),
    prisma.shiftChecklist.create({
      data: {
        hallId: senHall.id,
        shiftDate: today,
        shiftType: ShiftType.DAY,
        title: "Склад и сеновал",
      },
    }),
  ]);

  await Promise.all([
    prisma.checklistItem.createMany({
      data: [
        { checklistId: parChecklist.id, sortOrder: 1, label: "Проверка температуры печи", completedAt: atTime(today, 8, 30), completedBy: "Иван" },
        { checklistId: parChecklist.id, sortOrder: 2, label: "Запас пихты в зале", completedAt: atTime(today, 8, 45), completedBy: "Иван" },
        { checklistId: parChecklist.id, sortOrder: 3, label: "Вентиляция и гидромет", completedAt: atTime(today, 9, 0), completedBy: "Иван" },
      ],
    }),
    prisma.checklistItem.createMany({
      data: [
        { checklistId: vipChecklist.id, sortOrder: 1, label: "Подготовка VIP-ложа", completedAt: atTime(today, 9, 0), completedBy: "Ольга" },
        { checklistId: vipChecklist.id, sortOrder: 2, label: "Проверка массажного кабинета" },
        { checklistId: vipChecklist.id, sortOrder: 3, label: "Мини-бар и расходники" },
      ],
    }),
    prisma.checklistItem.createMany({
      data: [
        { checklistId: senChecklist.id, sortOrder: 1, label: "Остаток сена на полу", completedAt: atTime(today, 8, 15), completedBy: "Пётр" },
        { checklistId: senChecklist.id, sortOrder: 2, label: "Влажность сеновалa" },
        { checklistId: senChecklist.id, sortOrder: 3, label: "Инвентаризация веток" },
      ],
    }),
  ]);

    console.info(
      "Seed OK: 4 зала, 6 гостей, 8 броней, spa/kitchen, FIFO inventory, finance, checklists."
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
