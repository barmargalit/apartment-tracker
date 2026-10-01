"use client";

import { Line } from "@ant-design/charts";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Price, PriceHistory } from "@apartment-tracker/types";
import { useTheme } from "@/components/layout/ThemeProvider";
import EmptyState from "@/components/shared/EmptyState";

dayjs.extend(customParseFormat);

interface ChartPoint {
  date: string;
  price: number;
  comment: string | null;
}

interface Props {
  current: Price | null;
  history: PriceHistory[];
  unit: string;
}

export default function PriceHistoryChart({ current, history, unit }: Props) {
  const { isDark } = useTheme();

  if (!current && history.length === 0) return <EmptyState />;

  const points: ChartPoint[] = [
    ...history.map((h) => ({
      date: dayjs(h.valid_from).format("DD/MM/YY"),
      price: Number(h.price),
      comment: h.comment,
    })),
    ...(current
      ? [{ date: dayjs(current.valid_from).format("DD/MM/YY"), price: Number(current.price), comment: current.comment }]
      : []),
  ].sort(
    (a, b) =>
      dayjs(a.date, "DD/MM/YY").valueOf() - dayjs(b.date, "DD/MM/YY").valueOf(),
  );

  const config = {
    data: points,
    xField: "date",
    yField: "price",
    theme: isDark ? "classicDark" : "classic",
    axis: {
      y: { title: `Price (${unit})` },
    },
    point: { shapeField: "circle", sizeField: 4 },
    smooth: false,
    tooltip: {
      items: [
        (d: ChartPoint) => ({ name: "Price", value: `${Number(d.price).toFixed(4)} ${unit}` }),
        (d: ChartPoint) => d.comment ? { name: "Comment", value: d.comment } : null,
      ],
    },
  };

  return <Line {...config} />;
}
