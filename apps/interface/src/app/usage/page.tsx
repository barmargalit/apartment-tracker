"use client";

import {useState} from "react";
import {Button} from "antd";
import {
    ImportOutlined,
    ThunderboltOutlined,
    ExperimentOutlined,
    FireOutlined,
    LineChartOutlined,
} from "@ant-design/icons";
import {usePageHeader} from "@/components/PageHeaderContext";
import ImportModal from "@/components/ImportModal";
import SimulatorModal from "@/components/SimulatorModal";
import PageTabs from "@/components/PageTabs";
import UsageAreaChart from "@/components/UsageAreaChart";
import {useUsagesStore} from "@/store/usagesStore";
import {BillType} from "@apartment-tracker/types";

export default function UsagePage() {
    const [importOpen, setImportOpen] = useState(false);
    const [simulatorOpen, setSimulatorOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<BillType>(BillType.Electric);
    const {usages} = useUsagesStore();

    usePageHeader({
        title: "Usage",
        actions: (
            <>
                <Button icon={<LineChartOutlined/>} onClick={() => setSimulatorOpen(true)}>
                    Simulator
                </Button>
                <Button type="primary" icon={<ImportOutlined/>} onClick={() => setImportOpen(true)}>
                    Import
                </Button>
            </>
        ),
    });

    const tabs = [
        {key: BillType.Electric, label: "Electric", icon: <ThunderboltOutlined/>},
        {key: BillType.Water, label: "Water", icon: <ExperimentOutlined/>},
        {key: BillType.Gas, label: "Gas", icon: <FireOutlined/>},
    ];

    return (
        <>
            <PageTabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as BillType)}
                items={tabs.map(({key, label, icon}) => ({
                    key,
                    label: (
                        <span style={{display: "flex", alignItems: "center", gap: 6}}>
                            {icon}
                            {label}
                        </span>
                    ),
                    children: <UsageAreaChart type={key}/>,
                }))}
            />
            <ImportModal open={importOpen} onClose={() => setImportOpen(false)} defaultType={activeTab}/>
            <SimulatorModal
                open={simulatorOpen}
                onClose={() => setSimulatorOpen(false)}
                usageData={usages[activeTab]}
            />
        </>
    );
}
