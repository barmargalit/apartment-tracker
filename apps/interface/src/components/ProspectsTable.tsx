"use client";

import { useEffect, useState } from "react";
import { Button, Space } from "antd";
import { CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { Prospect } from "@apartment-tracker/types";
import { useProspectsStore } from "@/store/prospectsStore";
import DataTable from "./DataTable";
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
      title: "Contractor",
      dataIndex: "contractor",
      key: "contractor",
      render: (v: string | null) => v ?? "-",
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (v: string | null) => v ?? "-",
    },
    {
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_: unknown, prospect: Prospect) => (
        <Space style={{ opacity: hoveredId === prospect.id ? 1 : 0, transition: "opacity 0.15s" }}>
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
