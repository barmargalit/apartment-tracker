"use client";

import { useEffect, useState } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { usePageHeader } from "@/components/PageHeaderContext";
import { useResidencesStore } from "@/store/residencesStore";
import ResidenceCard from "@/components/ResidenceCard";
import ResidenceModal from "@/components/ResidenceModal";
import type { Residence } from "@apartment-tracker/types";

export default function MyAddressPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null);
  const { residences, fetchAll, updateResidence, deleteResidence } = useResidencesStore();

  useEffect(() => {
    fetchAll();
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
      <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedResidence(null); setModalOpen(true); }}>
        New
      </Button>
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
    </>
  );
}
