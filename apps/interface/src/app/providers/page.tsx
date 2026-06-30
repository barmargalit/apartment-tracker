"use client";

import { useEffect, useState } from "react";
import { Button, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import type { Provider } from "@apartment-tracker/types";
import { usePageHeader } from "@/components/PageHeaderContext";
import { useProvidersStore } from "@/store/providersStore";
import ProviderModal from "@/components/ProviderModal";
import DataTable from "@/components/DataTable";

const TYPE_COLOR: Record<string, string> = {
  electric: "gold",
  water: "blue",
  internet: "purple",
  gas: "orange",
};

export default function ProvidersPage() {
  usePageHeader({
    title: "Providers",
    actions: (
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
        New
      </Button>
    ),
  });

  const { providers, loading, fetchAll, deleteProvider } = useProvidersStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);


  const columns: TableColumnsType<Provider> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Bill Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={TYPE_COLOR[type]} style={{ textTransform: "capitalize" }}>
          {type}
        </Tag>
      ),
    },
    {
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_: unknown, provider: Provider) => (
        <Space style={{ opacity: hoveredId === provider.id ? 1 : 0, transition: "opacity 0.15s" }}>
          <Button type="text" icon={<EditOutlined />} onClick={() => setEditingProvider(provider)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteProvider(provider.id)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable<Provider>
        rowKey="id"
        columns={columns}
        dataSource={providers}
        loading={loading}
        onRow={(provider) => ({
          onMouseEnter: () => setHoveredId(provider.id),
          onMouseLeave: () => setHoveredId(null),
        })}
      />
      <ProviderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <ProviderModal
        open={!!editingProvider}
        provider={editingProvider}
        onClose={() => setEditingProvider(null)}
      />
    </>
  );
}
