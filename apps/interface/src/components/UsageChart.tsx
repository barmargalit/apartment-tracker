"use client";

import { useState, useEffect } from "react";
import { Column } from "@ant-design/charts";
import { ColorPicker, Space, Typography } from "antd";
import dayjs from "dayjs";
import type { Bill, ElectricBillData, WaterBillData } from "@apartment-tracker/types";
import { useTheme } from "./ThemeProvider";
import EmptyState from "./EmptyState";

const STORAGE_KEY = "usage-chart-year-colors";
const DEFAULT_PALETTE = [
  "#1677ff", "#52c41a", "#fa8c16", "#722ed1",
  "#eb2f96", "#13c2c2", "#fadb14", "#f5222d",
];

function loadColors(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveColors(colors: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
}

function colorForYear(year: string, index: number, stored: Record<string, string>): string {
  return stored[year] ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
}

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
  const [yearColors, setYearColors] = useState<Record<string, string>>({});

  useEffect(() => {
    setYearColors(loadColors());
  }, []);

  if (data.length === 0) {
    return <EmptyState description="No data to display" />;
  }

  const grouped = new Map<string, { totalUsage: number; totalDays: number; year: string; period: string }>();
  for (const bill of data) {
    const { usage, period, year } = bill.data as ElectricBillData | WaterBillData;
    const key = `${year}-${period}`;
    const days = dayjs(bill.end_date).diff(dayjs(bill.start_date), "day") + 1;
    if (!grouped.has(key)) {
      grouped.set(key, { totalUsage: 0, totalDays: 0, year: String(year), period: `P${period}` });
    }
    const entry = grouped.get(key)!;
    entry.totalUsage += usage;
    entry.totalDays += days;
  }

  const chartData: ChartRow[] = Array.from(grouped.values())
    .map(({ totalUsage, totalDays, year, period }) => ({
      period,
      avgUsagePerDay: totalDays > 0 ? parseFloat((totalUsage / totalDays).toFixed(2)) : 0,
      year,
    }))
    .sort((a, b) => {
      const yearDiff = parseInt(a.year) - parseInt(b.year);
      if (yearDiff !== 0) return yearDiff;
      return parseInt(a.period.slice(1)) - parseInt(b.period.slice(1));
    });

  const yearsAsc = Array.from(new Set(chartData.map((r) => r.year))).sort();
  const years = [...yearsAsc].reverse();
  const colorRange = yearsAsc.map((y, i) => colorForYear(y, i, yearColors));

  const handleColorChange = (year: string, hex: string) => {
    const updated = { ...yearColors, [year]: hex };
    setYearColors(updated);
    saveColors(updated);
  };

  const periodOrder = ["P1", "P2", "P3", "P4", "P5", "P6"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Space style={{ marginBottom: 8, flexWrap: "wrap" }}>
        {years.map((year, i) => (
          <Space key={year} size={4}>
            <ColorPicker
              size="small"
              value={colorForYear(year, i, yearColors)}
              onChange={(_, hex) => handleColorChange(year, hex)}
              disabledAlpha
            />
            <Typography.Text style={{ fontSize: 12 }}>{year}</Typography.Text>
          </Space>
        ))}
      </Space>

      <div style={{ flex: 1, minHeight: 0 }}>
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
            color: { domain: yearsAsc, range: colorRange },
          }}
          legend={{ color: { position: "top", layout: { justifyContent: "center" } } }}
          axis={{
            y: { title: "Avg. Usage / Day (kWh)" },
            x: { title: "Period" },
          }}
        />
      </div>
    </div>
  );
}
