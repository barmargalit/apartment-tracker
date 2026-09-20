"use client";

import React, { useRef, useState } from "react";
import { Button, DatePicker, Space, Tag, theme, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined, WarningOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";

interface FilterDropdownProps {
  setSelectedKeys: (keys: React.Key[]) => void;
  selectedKeys: React.Key[];
  confirm: () => void;
  clearFilters?: () => void;
}
import dayjs, { Dayjs } from "dayjs";
import type { Contract, Provider, Residence, Resident } from "@apartment-tracker/types";
import DataTable from "./DataTable";
import { BillTypeTag, BILL_TYPE_LABEL } from "@/lib/billTypes";
import { BillType } from "@apartment-tracker/types";
import { colors } from "@/globals";

const DATE_FORMAT = "DD/MM/YY";

function isEnded(endDate: string | null) {
  return !!endDate && dayjs(endDate).isBefore(dayjs(), "day");
}

function isExpiringSoon(endDate: string | null) {
  if (!endDate) return false;
  const end = dayjs(endDate);
  const now = dayjs();
  return end.isAfter(now) && end.isBefore(now.add(2, "month"));
}

function DateRangeFilter({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) {
  const value = selectedKeys[0] as unknown as [Dayjs, Dayjs] | undefined;
  return (
    <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
      <DatePicker.RangePicker
        format={DATE_FORMAT}
        value={value ?? null}
        onChange={(dates) => setSelectedKeys(dates ? [dates as unknown as string] : [])}
      />
      <Space>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          size="small"
          onClick={() => confirm()}
        >
          Filter
        </Button>
        <Button size="small" onClick={() => { clearFilters?.(); confirm(); }}>
          Reset
        </Button>
      </Space>
    </div>
  );
}

interface Props {
  data: Contract[];
  loading?: boolean;
  providers: Provider[];
  residences?: Residence[];
  residents?: Resident[];
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
}

export default function ContractsTable({ data, loading, providers, residences = [], residents = [], onEdit, onDelete }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { token } = theme.useToken();
  const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));
  const residenceById = Object.fromEntries(residences.map((r) => [r.id, r]));
  const residentById = Object.fromEntries(residents.map((r) => [r.id, r]));

  const columns: TableColumnsType<Contract> = [
    {
      key: "alert",
      width: 32,
      render: (_: unknown, row: Contract) =>
        isExpiringSoon(row.end_date)
          ? <Tooltip title={`This contract is about to expire in ${dayjs(row.end_date).diff(dayjs(), "day")} days`}><WarningOutlined style={{ color: token.colorWarning, fontSize: 16 }} /></Tooltip>
          : null,
    },
    {
      title: "Provider",
      key: "provider_id",
      render: (_: unknown, row: Contract) => providerById[row.provider_id]?.name ?? "-",
      filters: providers.map((p) => ({ text: p.name, value: p.id })),
      onFilter: (value, row) => row.provider_id === value,
    },
    {
      title: "Residence / Resident",
      key: "residence_resident",
      render: (_: unknown, row: Contract) => {
        if (row.resident_id) return residentById[row.resident_id]?.name ?? "-";
        if (row.residence_id) {
          const r = residenceById[row.residence_id];
          return r ? `${r.street}, ${r.city}` : "-";
        }
        return "-";
      },
    },
    {
      title: "Type",
      key: "bill_type",
      render: (_: unknown, row: Contract) => <BillTypeTag type={row.bill_type} />,
      filters: (Object.values(BillType) as BillType[]).map((t) => ({
        text: <BillTypeTag type={t} />,
        value: t,
      })),
      onFilter: (value, row) => row.bill_type === value,
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, row: Contract) =>
        isEnded(row.end_date)
          ? <Tag color="red">Ended</Tag>
          : <Tag color="green">Active</Tag>,
      filters: [
        { text: <Tag color="green">Active</Tag>, value: "active" },
        { text: <Tag color="red">Ended</Tag>, value: "ended" },
      ],
      onFilter: (value, row) =>
        value === "ended" ? isEnded(row.end_date) : !isEnded(row.end_date),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (value: string) => dayjs(value).format(DATE_FORMAT),
      filterDropdown: (props) => <DateRangeFilter {...props} />,
      onFilter: (value, row) => {
        const [from, to] = value as unknown as [Dayjs, Dayjs];
        const d = dayjs(row.start_date);
        return d.isAfter(from.subtract(1, "day")) && d.isBefore(to.add(1, "day"));
      },
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (value: string | null) => value ? dayjs(value).format(DATE_FORMAT) : "—",
      filterDropdown: (props) => <DateRangeFilter {...props} />,
      onFilter: (value, row) => {
        if (!row.end_date) return false;
        const [from, to] = value as unknown as [Dayjs, Dayjs];
        const d = dayjs(row.end_date);
        return d.isAfter(from.subtract(1, "day")) && d.isBefore(to.add(1, "day"));
      },
    },
    {
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_: unknown, row: Contract) => (
        <Space style={{ opacity: hoveredId === row.id ? 1 : 0, transition: "opacity 0.15s" }}>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(row)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(row)} />
        </Space>
      ),
    },
  ];

  return (
    <DataTable<Contract>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      onRow={(row) => ({
        onMouseEnter: () => setHoveredId(row.id),
        onMouseLeave: () => setHoveredId(null),
        style: isExpiringSoon(row.end_date) ? { background: colors.table.rowWarningBg } : undefined,
      })}
    />
  );
}
