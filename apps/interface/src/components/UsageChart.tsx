"use client";

import { Column } from "@ant-design/charts";
import dayjs from "dayjs";
import type { Bill, ElectricBillData, WaterBillData } from "@apartment-tracker/types";
import { useTheme } from "./ThemeProvider";
import EmptyState from "./EmptyState";

interface ChartRow {
  period: string;
  avgUsagePerDay: number;
  year: string;
}

interface Props {
  data: Bill[];
}

export default function UsageChart({ data }: Props) {
  const { isDark } = useTheme();

  if (data.length === 0) {
    return <EmptyState description="No data to display" />;
  }

  const chartData: ChartRow[] = data.map((bill) => {
    const { usage, period, year } = bill.data as ElectricBillData | WaterBillData;
    const days = dayjs(bill.end_date).diff(dayjs(bill.start_date), "day") + 1;
    return {
      period: `P${period}`,
      avgUsagePerDay: days > 0 ? parseFloat((usage / days).toFixed(2)) : 0,
      year: String(year),
    };
  });

  const periodOrder = ["P1", "P2", "P3", "P4", "P5", "P6"];

  return (
    <Column
      data={chartData}
      xField="period"
      yField="avgUsagePerDay"
      colorField="year"
      group
      theme={{ type: isDark ? "classicDark" : "classic" }}
      scale={{
        y: { domainMin: 0, zero: true, nice: true },
        x: { domain: periodOrder },
      }}
      legend={{ color: { position: "top", layout: { justifyContent: "center" } } }}
      axis={{
        y: { title: "Avg. Usage / Day (kWh)" },
        x: { title: "Period" },
      }}
    />
  );
}
