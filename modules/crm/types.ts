export type GuestRow = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  bookingsToday: number;
};

export type TodayBookingRow = {
  id: string;
  guestName: string;
  hallName: string | null;
  serviceName: string | null;
  timeLabel: string;
  status: string;
  statusCode: string;
  partySize: number;
};

export type CrmResult =
  | {
      kind: "data";
      guests: GuestRow[];
      todayBookings: TodayBookingRow[];
    }
  | { kind: "empty"; message: string };

export function isCrmEmpty(
  result: CrmResult
): result is Extract<CrmResult, { kind: "empty" }> {
  return result.kind === "empty";
}
