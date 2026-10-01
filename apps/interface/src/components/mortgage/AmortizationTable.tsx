"use client";

import { Table } from "antd";
import type { TableColumnsType } from "antd";
import type { AmortizationRow } from "@/lib/mortgageUtils";

interface Props {
  rows: AmortizationRow[];
}

const fmt = (n: number) =>
  `₪${n.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const columns: TableColumnsType<AmortizationRow> = [
  {
    title: "Month",
    dataIndex: "month",
    key: "month",
    width: 72,
    fixed: "left",
  },
  {
    title: "Beginning Balance",
    dataIndex: "beginningBalance",
    key: "beginningBalance",
    render: fmt,
  },
  {
    title: "Scheduled Payment",
    dataIndex: "scheduledPayment",
    key: "scheduledPayment",
    render: fmt,
  },
  {
    title: "Principal",
    dataIndex: "principal",
    key: "principal",
    render: fmt,
  },
  {
    title: "Interest",
    dataIndex: "interest",
    key: "interest",
    render: fmt,
  },
  {
    title: "Ending Balance",
    dataIndex: "endingBalance",
    key: "endingBalance",
    render: fmt,
  },
];

export default function AmortizationTable({ rows }: Props) {
  return (
    <Table<AmortizationRow>
      rowKey="month"
      columns={columns}
      dataSource={rows}
      size="small"
      pagination={{ pageSize: 12, showSizeChanger: false }}
      scroll={{ x: "max-content" }}
      sticky={{ offsetHeader: 0 }}
    />
  );
}
