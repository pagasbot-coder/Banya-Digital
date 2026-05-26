/** Сегменты гостя (MVP — в поле notes). */
export const GUEST_SEGMENTS = [
  "VIP",
  "Постоянный",
  "Новый",
  "Корпоративный",
] as const;

export type GuestSegment = (typeof GUEST_SEGMENTS)[number];

export const BOOKING_STATUS_OPTIONS = [
  { value: "PENDING", label: "Ожидает" },
  { value: "CONFIRMED", label: "Подтверждена" },
  { value: "CHECKED_IN", label: "На объекте" },
  { value: "COMPLETED", label: "Завершена" },
  { value: "CANCELLED", label: "Отменена" },
] as const;
