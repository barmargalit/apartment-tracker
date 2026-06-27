"use client";

import { Column } from "@ant-design/charts";
import dayjs from "dayjs";
import type { Bill, ElectricBillData, WaterBillData } from "@apartment-tracker/types";

interface ChartRow {
  period: string;
  avgUsagePerDay: number;
  year: string;
}

interface Props {
  data: Bill[];
}

export default function UsageChart({ data }: Props) {
  const chartData: ChartRow[] = data.map((bill) => {
    const { usage, period, year } = bill.data as ElectricBillData | WaterBillData;
    const days = dayjs(bill.end_date).diff(dayjs(bill.start_date), "day");
    return {
      period: `P${period}`,
      avgUsagePerDay: days > 0 ? parseFloat((usage / days).toFixed(2)) : 0,
      year: String(year),
    };
  });

  return (
    <Column
      data={chartData}
      xField="period"
      yField="avgUsagePerDay"
      colorField="year"
      group
      scale={{ y: { domainMin: 0, zero: true, nice: true } }}
      legend={{ color: { position: "top", layout: { justifyContent: "center" } } }}
      axis={{
        y: { title: "Avg. Usage / Day" },
        x: { title: "Period" },
      }}
    />
  );
}
