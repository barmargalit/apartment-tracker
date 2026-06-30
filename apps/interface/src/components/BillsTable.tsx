"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button, Space, Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { BillType } from "@apartment-tracker/types";
import type { Bill, ElectricBillData, Residence, WaterBillData } from "@apartment-tracker/types";
import { calcPeriodDays, calcPeriodUsage } from "@/lib/billUtils";
import DataTable from "./DataTable";

const DATE_FORMAT = "DD/MM/YY";

interface GroupedRow {
  key: string;
  year: number;
  period: number;
  residence: string;
  start_date: string | Date;
  end_date: string | Date;
  days: number;
  usage: number;
  price: number;
  bills: Bill[];
}

interface Props {
  data: Bill[];
  loading?: boolean;
  showUsage?: boolean;
  type?: BillType;
  residences?: Residence[];
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

function groupBills(bills: Bill[], residenceById: Record<string, Residence>): GroupedRow[] {
  const map = new Map<string, Bill[]>();
  for (const bill of bills) {
    const { year, period } = bill.data as ElectricBillData | WaterBillData;
    const key = `${year}-${period}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(bill);
  }

  const rows: GroupedRow[] = [];
  for (const [key, group] of map.entries()) {
    const sorted = [...group].sort((a, b) => dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf());
    const { year, period } = sorted[0].data as ElectricBillData | WaterBillData;

    const days = calcPeriodDays(sorted);
    const usage = calcPeriodUsage(sorted);
    const price = sorted.reduce((sum, b) => sum + parseFloat(String(b.price)), 0);

    const seenIds = new Set<string>();
    const residenceLabels: string[] = [];
    for (const bill of sorted) {
      if (bill.residence_id && !seenIds.has(bill.residence_id)) {
        seenIds.add(bill.residence_id);
        const r = residenceById[bill.residence_id];
        residenceLabels.push(r ? `${r.street}` : "-");
      }
    }
    const residence = residenceLabels.length === 0 ? "-" : residenceLabels.join(" → ");

    rows.push({
      key,
      year,
      period,
      residence,
      start_date: sorted[0].start_date,
      end_date: sorted[sorted.length - 1].end_date,
      days,
      usage,
      price,
      bills: sorted,
    });
  }

  return rows.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.period - a.period;
  });
}

export default function BillsTable({ data, loading, showUsage, type, residences = [], onEdit, onDelete }: Props) {
  const residenceById = Object.fromEntries(residences.map((r) => [r.id, r]));
  const usageUnit = type === BillType.Electric ? "kWh" : "m³";
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (showUsage) {
    const grouped = groupBills(data, residenceById);

    const childColumns: TableColumnsType<Bill> = [
      {
        title: "Residence",
        key: "residence_id",
        render: (_: unknown, bill: Bill) => {
          if (!bill.residence_id) return "-";
          const r = residenceById[bill.residence_id];
          return r ? `${r.street}, ${r.city}` : "-";
        },
      },
      {
        title: "Start Date",
        dataIndex: "start_date",
        key: "start_date",
        render: (value: Date) => dayjs(value).format(DATE_FORMAT),
      },
      {
        title: "End Date",
        dataIndex: "end_date",
        key: "end_date",
        render: (value: Date) => dayjs(value).format(DATE_FORMAT),
      },
      {
        title: "# Days",
        key: "days",
        render: (_: unknown, bill: Bill) => dayjs(bill.end_date).diff(dayjs(bill.start_date), "day") + 1,
      },
      {
        title: `Usage (${usageUnit})`,
        key: "usage",
        render: (_: unknown, bill: Bill) => ((bill.data as ElectricBillData | WaterBillData).usage ?? 0).toFixed(2),
      },
      {
        title: `Avg. Usage/Day (${usageUnit})`,
        key: "avg_usage_day",
        render: (_: unknown, bill: Bill) => {
          const d = dayjs(bill.end_date).diff(dayjs(bill.start_date), "day") + 1;
          const u = (bill.data as ElectricBillData | WaterBillData).usage;
          return d > 0 ? (u / d).toFixed(2) : "-";
        },
      },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (value: number | string) => `₪${parseFloat(String(value)).toFixed(2)}`,
      },
      {
        key: "actions",
        fixed: "right",
        width: 80,
        render: (_: unknown, bill: Bill) => (
          <Space style={{ opacity: hoveredId === bill.id ? 1 : 0, transition: "opacity 0.15s" }}>
            <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(bill)} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(bill)} />
          </Space>
        ),
      },
    ];

    const groupedColumns: TableColumnsType<GroupedRow> = [
      { title: "Year", dataIndex: "year", key: "year" },
      { title: "Period", dataIndex: "period", key: "period" },
      { title: "Residence", dataIndex: "residence", key: "residence" },
      {
        title: "Start Date",
        dataIndex: "start_date",
        key: "start_date",
        render: (value: Date) => dayjs(value).format(DATE_FORMAT),
      },
      {
        title: "End Date",
        dataIndex: "end_date",
        key: "end_date",
        render: (value: Date) => dayjs(value).format(DATE_FORMAT),
      },
      { title: "# Days", dataIndex: "days", key: "days" },
      { title: `Usage (${usageUnit})`, dataIndex: "usage", key: "usage", render: (v: number) => (v ?? 0).toFixed(2) },
      {
        title: `Avg. Usage/Day (${usageUnit})`,
        key: "avg_usage_day",
        render: (_: unknown, row: GroupedRow) => row.days > 0 ? (row.usage / row.days).toFixed(2) : "-",
      },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (value: number) => `₪${value.toFixed(2)}`,
      },
      {
        key: "actions",
        fixed: "right",
        width: 80,
        render: (_: unknown, row: GroupedRow) =>
          row.bills.length === 1 ? (
            <Space style={{ opacity: hoveredId === row.key ? 1 : 0, transition: "opacity 0.15s" }}>
              <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(row.bills[0])} />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(row.bills[0])} />
            </Space>
          ) : null,
      },
    ];

    return (
      <DataTable<GroupedRow>
        rowKey="key"
        columns={groupedColumns}
        dataSource={grouped}
        loading={loading}
        expandable={{
          expandedRowRender: (row) => (
            <Table<Bill>
              size="small"
              columns={childColumns}
              dataSource={row.bills}
              rowKey="id"
              pagination={false}
              onRow={(bill) => ({
                onMouseEnter: () => setHoveredId(bill.id),
                onMouseLeave: () => setHoveredId(null),
              })}
            />
          ),
          rowExpandable: (row) => row.bills.length > 1,
        }}
        onRow={(row) => ({
          onMouseEnter: () => setHoveredId(row.key),
          onMouseLeave: () => setHoveredId(null),
        })}
      />
    );
  }

  const columns: TableColumnsType<Bill> = [
    {
      title: "Residence",
      key: "residence_id",
      render: (_: unknown, bill: Bill) => {
        if (!bill.residence_id) return "-";
        const r = residenceById[bill.residence_id];
        return r ? `${r.street}, ${r.city}` : "-";
      },
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (value: Date) => dayjs(value).format(DATE_FORMAT),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (value: Date) => dayjs(value).format(DATE_FORMAT),
    },
    {
      title: "# Days",
      key: "days",
      render: (_: unknown, bill: Bill) => dayjs(bill.end_date).diff(dayjs(bill.start_date), "day") + 1,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value: number | string) => `₪${parseFloat(String(value)).toFixed(2)}`,
    },
    {
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_: unknown, bill: Bill) => (
        <Space style={{ opacity: hoveredId === bill.id ? 1 : 0, transition: "opacity 0.15s" }}>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(bill)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(bill)} />
        </Space>
      ),
    },
  ];

  return (
    <DataTable<Bill>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      onRow={(bill) => ({
        onMouseEnter: () => setHoveredId(bill.id),
        onMouseLeave: () => setHoveredId(null),
      })}
    />
  );
}
