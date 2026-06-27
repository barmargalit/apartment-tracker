"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { Bill, ElectricBillData, WaterBillData } from "@apartment-tracker/types";
import DataTable from "./DataTable";

const DATE_FORMAT = "DD/MM/YY";

interface Props {
  data: Bill[];
  loading?: boolean;
  showUsage?: boolean;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

export default function BillsTable({ data, loading, showUsage, onEdit, onDelete }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const periodYearColumns: TableColumnsType<Bill> = [
    {
      title: "Year",
      key: "year",
      render: (_: unknown, bill: Bill) => (bill.data as ElectricBillData | WaterBillData).year,
    },
    {
      title: "Period",
      key: "period",
      render: (_: unknown, bill: Bill) => (bill.data as ElectricBillData | WaterBillData).period,
    },
  ];

  const usageColumns: TableColumnsType<Bill> = [
    {
      title: "Usage",
      key: "usage",
      render: (_: unknown, bill: Bill) => (bill.data as ElectricBillData | WaterBillData).usage,
    },
    {
      title: "Avg. Usage/Day",
      key: "avg_usage_day",
      render: (_: unknown, bill: Bill) => {
        const days = dayjs(bill.end_date).diff(dayjs(bill.start_date), "day");
        const usage = (bill.data as ElectricBillData | WaterBillData).usage;
        return days > 0 ? (usage / days).toFixed(2) : "-";
      },
    },
  ];

  const columns: TableColumnsType<Bill> = [
    ...(showUsage ? periodYearColumns : []),
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
      render: (_: unknown, bill: Bill) => dayjs(bill.end_date).diff(dayjs(bill.start_date), "day"),
    },
    ...(showUsage ? usageColumns : []),
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_: unknown, bill: Bill) => (
        <Space style={{ opacity: hoveredId === bill.id ? 1 : 0, transition: "opacity 0.15s" }}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(bill)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(bill)}
          />
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
