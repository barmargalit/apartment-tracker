"use client";

import { useEffect, useState } from "react";
import { Button, Divider, Statistic, Typography } from "antd";
import { PlusOutlined, ThunderboltOutlined, ExperimentOutlined } from "@ant-design/icons";
import { BillType, PriceHistory } from "@apartment-tracker/types";
import { usePageHeader } from "@/components/layout/PageHeaderContext";
import PageTabs from "@/components/layout/PageTabs";
import PriceHistoryChart from "@/components/prices/PriceHistoryChart";
import PriceHistoryTable from "@/components/prices/PriceHistoryTable";
import AddPriceModal from "@/components/prices/AddPriceModal";
import { usePricesStore } from "@/store/pricesStore";
import { useProvidersStore } from "@/store/providersStore";
import styles from "./prices.module.css";

const { Text } = Typography;

const PRICE_UNIT: Partial<Record<BillType, string>> = {
  [BillType.Electric]: "₪/kWh",
  [BillType.Water]: "₪/m³",
};

interface PriceTabProps {
  type: BillType;
  onEdit: (record: PriceHistory) => void;
}

function PriceTab({ type, onEdit }: PriceTabProps) {
  const { current, history, loading, fetchCurrentByType, fetchHistoryByType } = usePricesStore();
  const { providers, fetchAll: fetchProviders } = useProvidersStore();
  const currentPrice = current[type] ?? null;
  const priceHistory = history[type] ?? [];
  const unit = PRICE_UNIT[type] ?? "₪";

  useEffect(() => {
    fetchCurrentByType(type);
    fetchHistoryByType(type);
    fetchProviders(type);
  }, [type]);

  return (
    <div className={styles.tabContent}>
      <div className={styles.currentPrice}>
        {currentPrice ? (
          <Statistic
            title="Current Price"
            value={Number(currentPrice.price)}
            precision={4}
            suffix={unit}
          />
        ) : (
          <Text type="secondary">No price set yet</Text>
        )}
      </div>
      <div className={styles.chart}>
        <PriceHistoryChart current={currentPrice} history={priceHistory} unit={unit} />
      </div>
      <Divider />
      <PriceHistoryTable
        current={currentPrice}
        data={priceHistory}
        loading={loading[type]}
        providers={providers}
        unit={unit}
        onEdit={onEdit}
      />
    </div>
  );
}

export default function PricesPage() {
  const [activeTab, setActiveTab] = useState<BillType>(BillType.Electric);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<PriceHistory | null>(null);

  const handleEdit = (record: PriceHistory) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditRecord(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditRecord(null);
  };

  usePageHeader({
    title: "Prices",
    actions: (
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
        Add Price
      </Button>
    ),
  });

  const tabs = [
    {
      key: BillType.Electric,
      label: "Electric",
      icon: <ThunderboltOutlined />,
      content: <PriceTab type={BillType.Electric} onEdit={handleEdit} />,
    },
    {
      key: BillType.Water,
      label: "Water",
      icon: <ExperimentOutlined />,
      content: <PriceTab type={BillType.Water} onEdit={handleEdit} />,
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

      <AddPriceModal
        open={modalOpen}
        billType={activeTab}
        editRecord={editRecord}
        onClose={handleClose}
      />
    </>
  );
}
