"use client";

import {useEffect, useState} from "react";
import {Button, Space} from "antd";
import type {BillType} from "@apartment-tracker/types";
import {EditOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import type {TableColumnsType} from "antd";
import type {Provider} from "@apartment-tracker/types";
import {usePageHeader} from "@/components/layout/PageHeaderContext";
import {useProvidersStore} from "@/store/providersStore";
import ProviderModal from "@/components/providers/ProviderModal";
import DataTable from "@/components/shared/DataTable";
import {BillTypeTag} from "@/lib/billTypes";

export default function ProvidersPage() {
    usePageHeader({
        title: "Providers",
        actions: (
            <Button type="primary" icon={<PlusOutlined/>} onClick={() => setCreateOpen(true)}>
                New
            </Button>
        ),
    });

    const {providers, loading, fetchAll, deleteProvider} = useProvidersStore();
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
            title: "Bill Types",
            dataIndex: "types",
            key: "types",
            render: (types: BillType[]) => (
                <Space size={4} wrap>
                    {types.map((type) => <BillTypeTag type={type} key={type}/>)}
                </Space>
            ),
        },
        {
            key: "actions",
            fixed: "right",
            width: 80,
            render: (_: unknown, provider: Provider) => (
                <Space style={{opacity: hoveredId === provider.id ? 1 : 0, transition: "opacity 0.15s"}}>
                    <Button type="text" icon={<EditOutlined/>} onClick={() => setEditingProvider(provider)}/>
                    <Button type="text" danger icon={<DeleteOutlined/>} onClick={() => deleteProvider(provider.id)}/>
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
