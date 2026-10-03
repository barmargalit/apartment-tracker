"use client";

import { useEffect, useState } from "react";
import { Button, Space } from "antd";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { usePageHeader } from "@/components/layout/PageHeaderContext";
import { useResidencesStore } from "@/store/residencesStore";
import { useResidentsStore } from "@/store/residentsStore";
import ResidenceCard from "@/components/residences/ResidenceCard";
import ResidenceModal from "@/components/residences/ResidenceModal";
import ResidentsDrawer from "@/components/residences/ResidentsDrawer";
import type { Residence } from "@xpensive/types";

export default function MyAddressPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [residentsOpen, setResidentsOpen] = useState(false);
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null);
  const { residences, fetchAll, updateResidence, deleteResidence } = useResidencesStore();
  const { fetchAll: fetchResidents } = useResidentsStore();

  useEffect(() => {
    fetchAll();
    fetchResidents();
  }, []);

  const handleEdit = (residence: Residence) => {
    setSelectedResidence(residence);
    setModalOpen(true);
  };

  const handleToggleCurrent = (residence: Residence) => {
    updateResidence(residence.id, { current: residence.current === 1 ? 0 : 1 });
  };

  const handleDelete = (residence: Residence) => {
    deleteResidence(residence.id);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedResidence(null);
  };

  usePageHeader({
    title: "My Residence",
    actions: (
      <Space>
        <Button icon={<TeamOutlined />} onClick={() => setResidentsOpen(true)}>
          Residents
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedResidence(null); setModalOpen(true); }}>
          New
        </Button>
      </Space>
    ),
  });

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        {residences.map((r) => (
          <ResidenceCard
            key={r.id}
            residence={r}
            onToggleCurrent={handleToggleCurrent}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ResidenceModal
        open={modalOpen}
        residence={selectedResidence}
        onClose={handleClose}
      />

      <ResidentsDrawer
        open={residentsOpen}
        onClose={() => setResidentsOpen(false)}
      />
    </>
  );
}
