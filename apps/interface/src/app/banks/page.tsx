"use client";

import { useEffect, useState } from "react";
import { Button, Space } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { Bank } from "@apartment-tracker/types";
import { usePageHeader } from "@/components/PageHeaderContext";
import { useBanksStore } from "@/store/banksStore";
import BankModal from "@/components/BankModal";
import DataTable from "@/components/DataTable";

export default function BanksPage() {
  const { banks, loading, fetchAll, deleteBank } = useBanksStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  usePageHeader({
    title: "Banks",
    actions: (
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
        New
      </Button>
    ),
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const columns: TableColumnsType<Bank> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_: unknown, bank: Bank) => (
        <Space style={{ opacity: hoveredId === bank.id ? 1 : 0, transition: "opacity 0.15s" }}>
          <Button type="text" icon={<EditOutlined />} onClick={() => setEditingBank(bank)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteBank(bank.id)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable<Bank>
        rowKey="id"
        columns={columns}
        dataSource={banks}
        loading={loading}
        onRow={(bank) => ({
          onMouseEnter: () => setHoveredId(bank.id),
          onMouseLeave: () => setHoveredId(null),
        })}
      />
      <BankModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <BankModal open={!!editingBank} bank={editingBank} onClose={() => setEditingBank(null)} />
    </>
  );
}
