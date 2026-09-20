"use client";

import { useState } from "react";
import { Button, Card, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import type { Resident } from "@apartment-tracker/types";
import DataTable from "./DataTable";
import ResidentModal from "./ResidentModal";
import { useResidentsStore } from "@/store/residentsStore";
import { useModal } from "./ThemeProvider";

const DATE_FORMAT = "DD/MM/YY";

export default function ResidentsCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { residents, loading, deleteResident } = useResidentsStore();
  const modal = useModal();

  const handleEdit = (resident: Resident) => {
    setSelectedResident(resident);
    setModalOpen(true);
  };

  const handleDelete = (resident: Resident) => {
    modal.confirm({
      title: "Delete Resident",
      content: `Are you sure you want to remove ${resident.name}?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => deleteResident(resident.id),
    });
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedResident(null);
  };

  const columns: TableColumnsType<Resident> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Birth Date",
      dataIndex: "birth_date",
      key: "birth_date",
      render: (value: string) => dayjs(value).format(DATE_FORMAT),
    },
    {
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_: unknown, row: Resident) => (
        <Space style={{ opacity: hoveredId === row.id ? 1 : 0, transition: "opacity 0.15s" }}>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Residents"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => { setSelectedResident(null); setModalOpen(true); }}
          >
            New
          </Button>
        }
      >
        <DataTable<Resident>
          rowKey="id"
          columns={columns}
          dataSource={residents}
          loading={loading}
          onRow={(row) => ({
            onMouseEnter: () => setHoveredId(row.id),
            onMouseLeave: () => setHoveredId(null),
          })}
        />
      </Card>

      <ResidentModal
        open={modalOpen}
        resident={selectedResident}
        onClose={handleClose}
      />
    </>
  );
}
