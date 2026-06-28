"use client";

import { useEffect, useState } from "react";
import { Button, Divider } from "antd";
import { PlusOutlined, ReloadOutlined, ThunderboltOutlined, ExperimentOutlined, WifiOutlined, FireOutlined } from "@ant-design/icons";
import { usePageHeader } from "@/components/PageHeaderContext";
import PageTabs from "@/components/PageTabs";
import BillsTable from "@/components/BillsTable";
import UsageChart from "@/components/UsageChart";
import BillModal from "@/components/BillModal";
import { useBillsStore } from "@/store/billsStore";
import { useResidencesStore } from "@/store/residencesStore";
import { Bill, BillType } from "@apartment-tracker/types";
import { useModal } from "@/components/ThemeProvider";
import styles from "./bills.module.css";

interface BillTabProps {
  type: BillType;
  showUsage?: boolean;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

function BillTab({ type, showUsage, onEdit, onDelete }: BillTabProps) {
  const { bills, loading, fetchByType } = useBillsStore();
  const { residences, fetchAll: fetchResidences } = useResidencesStore();
  const data = bills[type];

  useEffect(() => {
    fetchByType(type);
    fetchResidences();
  }, [type]);

  if (showUsage) {
    return (
      <div className={styles.splitLayout}>
        <div className={styles.chartPane}>
          <UsageChart data={data} />
        </div>
        <Divider />
        <div className={styles.tablePane}>
          <BillsTable
            data={data}
            loading={loading[type]}
            showUsage
            residences={residences}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <BillsTable
      data={data}
      loading={loading[type]}
      residences={residences}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

export default function BillsPage() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [activeTab, setActiveTab] = useState<BillType>(BillType.Electric);
  const { deleteBill, fetchByType, loading } = useBillsStore();
  const modal = useModal();

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setEditModalOpen(true);
  };

  const handleDelete = (bill: Bill) => {
    modal.confirm({
      title: "Delete Bill",
      content: "Are you sure you want to delete this bill? This action cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => deleteBill(bill.id, bill.type),
    });
  };

  const handleClose = () => {
    setEditModalOpen(false);
    setSelectedBill(null);
  };

  usePageHeader({
    title: "Bills",
    actions: (
      <>
        <Button
          type="text"
          icon={<ReloadOutlined />}
          loading={loading[activeTab]}
          onClick={() => fetchByType(activeTab)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedBill(null); setEditModalOpen(true); }}>
          New
        </Button>
      </>
    ),
  });

  const tabs = [
    {
      key: BillType.Electric,
      label: "Electric",
      icon: <ThunderboltOutlined />,
      content: <BillTab type={BillType.Electric} showUsage onEdit={handleEdit} onDelete={handleDelete} />,
    },
    {
      key: BillType.Water,
      label: "Water",
      icon: <ExperimentOutlined />,
      content: <BillTab type={BillType.Water} showUsage onEdit={handleEdit} onDelete={handleDelete} />,
    },
    {
      key: BillType.Internet,
      label: "Internet",
      icon: <WifiOutlined />,
      content: <BillTab type={BillType.Internet} onEdit={handleEdit} onDelete={handleDelete} />,
    },
    {
      key: BillType.Gas,
      label: "Gas",
      icon: <FireOutlined />,
      content: <BillTab type={BillType.Gas} onEdit={handleEdit} onDelete={handleDelete} />,
    },
  ];

  return (
    <>
      <PageTabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as BillType)}
        items={tabs.map(({ key, label, icon, content }) => ({
          key,
          label: (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {icon}
              {label}
            </span>
          ),
          children: content,
        }))}
      />

      <BillModal
        open={editModalOpen}
        bill={selectedBill}
        defaultType={activeTab}
        onClose={handleClose}
      />
    </>
  );
}
