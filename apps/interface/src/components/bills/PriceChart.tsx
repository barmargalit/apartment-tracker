"use client";

import { Line } from "@ant-design/charts";
import dayjs from "dayjs";
import type { Bill, ElectricBillData, WaterBillData } from "@xpensive/types";
import { useTheme } from "@/components/layout/ThemeProvider";
import EmptyState from "@/components/shared/EmptyState";
import YearColorLegend, { useYearColors, colorForYear } from "./YearColorLegend";

const STORAGE_KEY = "price-chart-year-colors-v2";
const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface ChartRow {
  xLabel: string;
  price: number;
  year: string;
}

interface Props {
  data: Bill[];
}

function buildPeriodicRows(data: Bill[]): { rows: ChartRow[]; domain: string[] } {
  const grouped = new Map<string, { totalPrice: number; year: string; xLabel: string }>();
  for (const bill of data) {
    const { period, year } = bill.data as ElectricBillData | WaterBillData;
    const key = `${year}-${period}`;
    if (!grouped.has(key)) {
      grouped.set(key, { totalPrice: 0, year: String(year), xLabel: `P${period}` });
    }
    grouped.get(key)!.totalPrice += Number(bill.price);
  }
  const rows = Array.from(grouped.values())
    .map(({ totalPrice, year, xLabel }) => ({
      xLabel,
      price: parseFloat(totalPrice.toFixed(2)),
      year,
    }))
    .sort((a, b) => {
      const yearDiff = parseInt(a.year) - parseInt(b.year);
      if (yearDiff !== 0) return yearDiff;
      return parseInt(a.xLabel.slice(1)) - parseInt(b.xLabel.slice(1));
    });
  return { rows, domain: ["P1", "P2", "P3", "P4", "P5", "P6"] };
}

function buildDateRows(data: Bill[]): { rows: ChartRow[]; domain: string[] } {
  const grouped = new Map<string, { totalPrice: number; year: string; xLabel: string; monthNum: number }>();
  for (const bill of data) {
    const d = dayjs(bill.start_date);
    const year = String(d.year());
    const monthNum = d.month(); // 0-indexed
    const xLabel = MONTH_ORDER[monthNum];
    const key = `${year}-${monthNum}`;
    if (!grouped.has(key)) {
      grouped.set(key, { totalPrice: 0, year, xLabel, monthNum });
    }
    grouped.get(key)!.totalPrice += Number(bill.price);
  }
  const rows = Array.from(grouped.values())
    .map(({ totalPrice, year, xLabel, monthNum }) => ({
      xLabel,
      price: parseFloat(totalPrice.toFixed(2)),
      year,
      monthNum,
    }))
    .sort((a, b) => {
      const yearDiff = parseInt(a.year) - parseInt(b.year);
      if (yearDiff !== 0) return yearDiff;
      return a.monthNum - b.monthNum;
    });
  const usedMonths = Array.from(new Set(rows.map((r) => r.xLabel)));
  const domain = MONTH_ORDER.filter((m) => usedMonths.includes(m));
  return { rows, domain };
}

export default function PriceChart({ data }: Props) {
  const { isDark } = useTheme();
  const { yearColors, handleColorChange } = useYearColors(STORAGE_KEY);

  if (data.length === 0) {
    return <EmptyState description="No data to display" />;
  }

  const isPeriodic = data.some((b) => (b.data as Partial<ElectricBillData>).period != null);
  const { rows: chartData, domain } = isPeriodic ? buildPeriodicRows(data) : buildDateRows(data);

  const yearsAsc = Array.from(new Set(chartData.map((r) => r.year))).sort();
  const colorRange = yearsAsc.map((y) => colorForYear(y, yearColors));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Line
          data={chartData}
          xField="xLabel"
          yField="price"
          colorField="year"
          theme={{ type: isDark ? "classicDark" : "classic" }}
          scale={{
            y: { domainMin: 0, zero: true, nice: true },
            x: { domain },
            color: { domain: yearsAsc, range: colorRange },
          }}
          legend={{ color: { position: "top", layout: { justifyContent: "center" } } }}
          axis={{
            y: { title: "Price (₪)" },
          }}
          point={{ shapeField: "circle", sizeField: 4 }}
          tooltip={{
            items: [
              (d: ChartRow) => ({
                name: d.year,
                value: `₪${d.price.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              }),
            ],
          }}
          {...(isPeriodic && {
            annotations: ["P1", "P3", "P5"].map((p) => ({
              type: "rangeX" as const,
              data: [p, p],
              style: {
                fill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                fillOpacity: 1,
              },
            })),
          })}
        />
      </div>

      <YearColorLegend yearsAsc={yearsAsc} yearColors={yearColors} onColorChange={handleColorChange} />
    </div>
  );
}
