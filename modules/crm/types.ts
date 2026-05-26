export type GuestRow = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  bookingsToday: number;
};

export type TodayBookingRow = {
  id: string;
  guestId: string;
  guestName: string;
  hallId: string | null;
  hallName: string | null;
  spaProgramId: string | null;
  spaProgramName: string | null;
  serviceName: string | null;
  timeLabel: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
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
