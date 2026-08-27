"use client";

import { Button, Space, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { Price, PriceHistory, Provider } from "@apartment-tracker/types";
import DataTable from "./DataTable";

const DATE_FORMAT = "DD/MM/YY";

interface Row {
  id: string;
  valid_from: Date;
  price: number;
  provider_id: string | null;
  comment: string | null;
  isCurrent: boolean;
  original: PriceHistory | null;
}

interface Props {
  current: Price | null;
  data: PriceHistory[];
  loading?: boolean;
  providers: Provider[];
  unit: string;
  onEdit: (record: PriceHistory) => void;
}

export default function PriceHistoryTable({ current, data, loading, providers, unit, onEdit }: Props) {
  const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));

  const rows: Row[] = [
    ...(current
      ? [{ id: current.id, valid_from: current.valid_from, price: current.price, provider_id: current.provider_id, comment: current.comment, isCurrent: true, original: null }]
      : []),
    ...data.map((h) => ({ id: h.id, valid_from: h.valid_from, price: h.price, provider_id: h.provider_id, comment: h.comment, isCurrent: false, original: h })),
  ].sort((a, b) => dayjs(b.valid_from).valueOf() - dayjs(a.valid_from).valueOf());

  const columns: TableColumnsType<Row> = [
    {
      title: "Date set",
      dataIndex: "valid_from",
      key: "valid_from",
      render: (v: Date, row) => (
        <Space>
          {dayjs(v).format(DATE_FORMAT)}
          {row.isCurrent && <Tag color="green">Current</Tag>}
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (v: number) => `${parseFloat(String(v)).toFixed(4)} ${unit}`,
    },
    {
      title: "Provider",
      dataIndex: "provider_id",
      key: "provider_id",
      render: (id: string | null) => (id ? (providerById[id]?.name ?? id) : "—"),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: unknown, row: Row) =>
        row.original ? (
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(row.original!)} />
        ) : null,
    },
  ];

  return (
    <DataTable<Row>
      dataSource={rows}
      columns={columns}
      loading={loading}
      rowKey="id"
    />
  );
}
