/** Экранирование ячейки CSV (RFC 4180). */
export function escapeCsvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Строка CSV из массива ячеек. */
export function csvRow(cells: (string | number)[]): string {
  return cells.map(escapeCsvCell).join(",");
}

/** UTF-8 BOM для корректного открытия в Excel. */
export const CSV_UTF8_BOM = "\uFEFF";
