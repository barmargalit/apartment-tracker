"use client";

import {useEffect, useState} from "react";
import {Button} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {usePageHeader} from "@/components/PageHeaderContext";
import {useModal} from "@/components/ThemeProvider";
import {useContractsStore} from "@/store/contractsStore";
import {useProvidersStore} from "@/store/providersStore";
import {useResidencesStore} from "@/store/residencesStore";
import {useResidentsStore} from "@/store/residentsStore";
import ContractModal from "@/components/ContractModal";
import ContractsTable from "@/components/ContractsTable";
import ExpiringContractsAlert from "@/components/ExpiringContractsAlert";
import type {Contract} from "@apartment-tracker/types";

export default function ContractsPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    const {contracts, loading, fetchAll, deleteContract} = useContractsStore();
    const {providers, fetchAll: fetchProviders} = useProvidersStore();
    const {residences, fetchAll: fetchResidences} = useResidencesStore();
    const {residents, fetchAll: fetchResidents} = useResidentsStore();
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
            okButtonProps: {danger: true},
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
            <Button type="primary" icon={<PlusOutlined/>} onClick={() => {
                setSelectedContract(null);
                setModalOpen(true);
            }}>
                New
            </Button>
        ),
    });

    return (
        <>
            <ExpiringContractsAlert style={{marginBottom: 16}} />
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
