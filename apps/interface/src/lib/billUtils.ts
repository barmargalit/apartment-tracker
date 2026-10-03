import dayjs from "dayjs";
import type { Bill, BillData, ElectricBillData, WaterBillData } from "@xpensive/types";

export const fmtPrice = (n: number) =>
    `₪${n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function billDurationMonths(
    startDate: Bill["start_date"] | string | Date,
    endDate: Bill["end_date"] | string | Date,
    data: BillData,
): number {
    const d = data as Partial<ElectricBillData & WaterBillData>;
    if (d.period != null) return 2;
    const days = dayjs(endDate).diff(dayjs(startDate), "day");
    return Math.max(1, Math.round(days / 30));
}

/**
 * Calculates the number of days covered by a group of bills for the same period.
 * When all bills share the same residence, days = span from earliest start to latest end
 * (avoids double-counting overlapping/consecutive billing periods at the same address).
 * When residences differ, days = sum of each bill's individual duration.
 */
export function calcPeriodDays(bills: Bill[]): number {
  const sorted = [...bills].sort((a, b) => dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf());
  const uniqueResidences = new Set(sorted.map((b) => b.residence_id ?? "none"));
  if (uniqueResidences.size === 1) {
    return dayjs(sorted[sorted.length - 1].end_date).diff(dayjs(sorted[0].start_date), "day") + 1;
  }
  return sorted.reduce((sum, b) => sum + dayjs(b.end_date).diff(dayjs(b.start_date), "day") + 1, 0);
}

export function calcPeriodUsage(bills: Bill[]): number {
  return bills.reduce((sum, b) => sum + (b.data as ElectricBillData | WaterBillData).usage, 0);
}
