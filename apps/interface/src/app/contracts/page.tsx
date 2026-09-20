"use client";

import { useEffect, useState } from "react";
import { Alert, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { usePageHeader } from "@/components/PageHeaderContext";
import { useModal } from "@/components/ThemeProvider";
import { useContractsStore } from "@/store/contractsStore";
import { useProvidersStore } from "@/store/providersStore";
import { useResidencesStore } from "@/store/residencesStore";
import { useResidentsStore } from "@/store/residentsStore";
import ContractModal from "@/components/ContractModal";
import ContractsTable from "@/components/ContractsTable";
import type { Contract } from "@apartment-tracker/types";

export default function ContractsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const { contracts, loading, fetchAll, deleteContract } = useContractsStore();
  const { providers, fetchAll: fetchProviders } = useProvidersStore();
  const { residences, fetchAll: fetchResidences } = useResidencesStore();
  const { residents, fetchAll: fetchResidents } = useResidentsStore();
  const modal = useModal();

  useEffect(() => {
    fetchAll();
    fetchProviders();
    fetchResidences();
    fetchResidents();
  }, []);

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setModalOpen(true);
  };

  const handleDelete = (contract: Contract) => {
    modal.confirm({
      title: "Delete Contract",
      content: "Are you sure you want to delete this contract? This action cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => deleteContract(contract.id),
    });
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedContract(null);
  };

  usePageHeader({
    title: "Contracts",
    actions: (
      <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedContract(null); setModalOpen(true); }}>
        New
      </Button>
    ),
  });

  const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));
  const expiringSoon = contracts.filter((c) => {
    if (!c.end_date) return false;
    const end = dayjs(c.end_date);
    const now = dayjs();
    return end.isAfter(now) && end.isBefore(now.add(2, "month"));
  });

  return (
    <>
      {expiringSoon.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`You have ${expiringSoon.length} contract${expiringSoon.length > 1 ? "s" : ""} expiring in the next 2 months:`}
          description={
            <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
              {expiringSoon.map((c) => (
                <li key={c.id}>
                  {providerById[c.provider_id]?.name ?? "Unknown provider"} — ends {dayjs(c.end_date).format("DD/MM/YY")}
                </li>
              ))}
            </ul>
          }
        />
      )}
      <ContractsTable
        data={contracts}
        loading={loading}
        providers={providers}
        residences={residences}
        residents={residents}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ContractModal
        open={modalOpen}
        contract={selectedContract}
        onClose={handleClose}
      />
    </>
  );
}
