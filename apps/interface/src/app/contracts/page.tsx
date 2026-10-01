"use client";

import {useEffect, useState} from "react";
import {Button} from "antd";
import {PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {usePageHeader} from "@/components/PageHeaderContext";
import {useContractsStore} from "@/store/contractsStore";
import {useProvidersStore} from "@/store/providersStore";
import {useResidencesStore} from "@/store/residencesStore";
import {useResidentsStore} from "@/store/residentsStore";
import ContractModal from "@/components/ContractModal";
import ContractsTable from "@/components/ContractsTable";
import CompareOffersModal from "@/components/CompareOffersModal";
import ExpiringContractsAlert from "@/components/ExpiringContractsAlert";
import type {Contract} from "@apartment-tracker/types";

export default function ContractsPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [compareOpen, setCompareOpen] = useState(false);
    const [comparedContractId, setComparedContractId] = useState<string | null>(null);

    const {contracts, loading, fetchAll} = useContractsStore();
    const comparedContract = contracts.find((c) => c.id === comparedContractId) ?? null;
    const {providers, fetchAll: fetchProviders} = useProvidersStore();
    const {residences, fetchAll: fetchResidences} = useResidencesStore();
    const {residents, fetchAll: fetchResidents} = useResidentsStore();

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

    const handleClose = () => {
        setModalOpen(false);
        setSelectedContract(null);
    };

    const handleCompare = (contract: Contract) => {
        setComparedContractId(contract.id);
        setCompareOpen(true);
    };

    usePageHeader({
        title: "Contracts",
        actions: (
            <>
                <Button
                    type="text"
                    icon={<ReloadOutlined/>}
                    loading={loading}
                    onClick={() => fetchAll()}
                />
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => {
                    setSelectedContract(null);
                    setModalOpen(true);
                }}>
                    New
                </Button>
            </>
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
                onCompare={handleCompare}
            />
            <ContractModal
                open={modalOpen}
                contract={selectedContract}
                onClose={handleClose}
            />
            <CompareOffersModal
                open={compareOpen}
                contract={comparedContract}
                providers={providers}
                onClose={() => { setCompareOpen(false); setComparedContractId(null); }}
            />
        </>
    );
}
