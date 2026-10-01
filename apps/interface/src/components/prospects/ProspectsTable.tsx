"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button, Space } from "antd";
import { CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined, FilePdfOutlined, PlayCircleOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { Prospect } from "@apartment-tracker/types";
import { useProspectsStore } from "@/store/prospectsStore";
import { prospectsApi } from "@/api/prospectsApi";
import DataTable from "@/components/shared/DataTable";
import ProspectModal from "./ProspectModal";

interface Props {
  createOpen: boolean;
  onCreateClose: () => void;
}

export default function ProspectsTable({ createOpen, onCreateClose }: Props) {
  const { prospects, loading, fetchAll, deleteProspect } = useProspectsStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const columns: TableColumnsType<Prospect> = [
    { title: "Street", dataIndex: "street", key: "street" },
    { title: "City", dataIndex: "city", key: "city" },
    { title: "m²", dataIndex: "square_meters", key: "square_meters" },
    {
      title: "Balcony m²",
      dataIndex: "balcony_square_meters",
      key: "balcony_square_meters",
      render: (v: number | null) => v ?? "-",
    },
    { title: "Rooms", dataIndex: "rooms", key: "rooms" },
    {
      title: "Parking",
      dataIndex: "parking",
      key: "parking",
      render: (v: boolean) =>
        v ? <CheckOutlined style={{ color: "#52c41a" }} /> : <CloseOutlined style={{ color: "#ff4d4f" }} />,
    },
    { title: "Safe Space", dataIndex: "safe_space", key: "safe_space" },
    {
      title: "Floor",
      dataIndex: "floor",
      key: "floor",
      render: (v: number | null) => v ?? "-",
    },
    {
      title: "Price (₪M)",
      dataIndex: "price",
      key: "price",
      render: (v: number | null) => v != null ? `₪${v}M` : "-",
    },
    {
      title: "Realtor",
      dataIndex: "realtor",
      key: "realtor",
      render: (v: boolean) =>
        v ? <CheckOutlined style={{ color: "#52c41a" }} /> : <CloseOutlined style={{ color: "#ff4d4f" }} />,
    },
    {
      title: "Realtor Fee",
      key: "realtor_fee",
      render: (_: unknown, record: Prospect) =>
        record.realtor && record.realtor_fee != null ? `${record.realtor_fee}%` : "-",
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (v: string | null) => v ?? "-",
    },
    {
      title: "Visited",
      dataIndex: "visited",
      key: "visited",
      render: (v: string | null) => v ? dayjs(v).format("DD/MM/YY") : "-",
    },
    {
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_: unknown, prospect: Prospect) => (
        <Space style={{ opacity: hoveredId === prospect.id ? 1 : 0, transition: "opacity 0.15s" }}>
          {prospect.floor_plan_url && (
            <a href={prospect.floor_plan_url} target="_blank" rel="noopener noreferrer">
              <Button type="text" icon={<FilePdfOutlined style={{ color: "#1677ff" }} />} />
            </a>
          )}
          {prospect.video_url && (
            <Button
              type="text"
              icon={<PlayCircleOutlined style={{ color: "#1677ff" }} />}
              onClick={() => prospectsApi.openFile(prospect.video_url!)}
            />
          )}
          <Button type="text" icon={<EditOutlined />} onClick={() => setEditingProspect(prospect)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteProspect(prospect.id)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable<Prospect>
        rowKey="id"
        columns={columns}
        dataSource={prospects}
        loading={loading}
        onRow={(prospect) => ({
          onMouseEnter: () => setHoveredId(prospect.id),
          onMouseLeave: () => setHoveredId(null),
        })}
      />
      <ProspectModal open={createOpen} onClose={onCreateClose} />
      <ProspectModal
        open={!!editingProspect}
        prospect={editingProspect}
        onClose={() => setEditingProspect(null)}
      />
    </>
  );
}
