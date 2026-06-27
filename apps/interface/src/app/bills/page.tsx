"use client";

import { useState } from "react";
import { Button, Modal } from "antd";
import { PlusOutlined, ThunderboltOutlined, ExperimentOutlined, WifiOutlined, FireOutlined } from "@ant-design/icons";
import { usePageHeader } from "@/components/PageHeaderContext";
import PageTabs from "@/components/PageTabs";
import BillsTable from "@/components/BillsTable";
import UsageChart from "@/components/UsageChart";
import { Bill, BillType, ElectricBillData, WaterBillData } from "@apartment-tracker/types";

const mockBills: Bill[] = [
  {
    id: "e1",
    type: BillType.Electric,
    start_date: new Date("2025-01-01"),
    end_date: new Date("2025-02-28"),
    price: 84.5,
    data: { usage: 320, period: 1, year: 2025 } as ElectricBillData,
    created: new Date("2025-03-01"),
    modified: new Date("2025-03-01"),
  },
  {
    id: "e2",
    type: BillType.Electric,
    start_date: new Date("2025-03-01"),
    end_date: new Date("2025-04-30"),
    price: 91.2,
    data: { usage: 348, period: 2, year: 2025 } as ElectricBillData,
    created: new Date("2025-05-01"),
    modified: new Date("2025-05-01"),
  },
  {
    id: "e3",
    type: BillType.Electric,
    start_date: new Date("2025-05-01"),
    end_date: new Date("2025-06-30"),
    price: 78.3,
    data: { usage: 295, period: 3, year: 2025 } as ElectricBillData,
    created: new Date("2025-07-01"),
    modified: new Date("2025-07-01"),
  },
  {
    id: "e4",
    type: BillType.Electric,
    start_date: new Date("2025-07-01"),
    end_date: new Date("2025-08-31"),
    price: 112.6,
    data: { usage: 430, period: 4, year: 2025 } as ElectricBillData,
    created: new Date("2025-09-01"),
    modified: new Date("2025-09-01"),
  },
  {
    id: "e5",
    type: BillType.Electric,
    start_date: new Date("2025-09-01"),
    end_date: new Date("2025-10-31"),
    price: 95.4,
    data: { usage: 362, period: 5, year: 2025 } as ElectricBillData,
    created: new Date("2025-11-01"),
    modified: new Date("2025-11-01"),
  },
  {
    id: "e6",
    type: BillType.Electric,
    start_date: new Date("2025-11-01"),
    end_date: new Date("2025-12-31"),
    price: 103.8,
    data: { usage: 395, period: 6, year: 2025 } as ElectricBillData,
    created: new Date("2026-01-01"),
    modified: new Date("2026-01-01"),
  },
  {
    id: "e7",
    type: BillType.Electric,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-02-28"),
    price: 88.9,
    data: { usage: 335, period: 1, year: 2026 } as ElectricBillData,
    created: new Date("2026-03-01"),
    modified: new Date("2026-03-01"),
  },
  {
    id: "e8",
    type: BillType.Electric,
    start_date: new Date("2026-03-01"),
    end_date: new Date("2026-04-30"),
    price: 82.1,
    data: { usage: 310, period: 2, year: 2026 } as ElectricBillData,
    created: new Date("2026-05-01"),
    modified: new Date("2026-05-01"),
  },
  {
    id: "3",
    type: BillType.Water,
    start_date: new Date("2025-01-01"),
    end_date: new Date("2025-01-31"),
    price: 32.0,
    data: { usage: 7.4, period: 1, year: 2025 } as WaterBillData,
    created: new Date("2025-02-01"),
    modified: new Date("2025-02-01"),
  },
  {
    id: "4",
    type: BillType.Water,
    start_date: new Date("2025-02-01"),
    end_date: new Date("2025-02-28"),
    price: 29.75,
    data: { usage: 6.9, period: 1, year: 2025 } as WaterBillData,
    created: new Date("2025-03-01"),
    modified: new Date("2025-03-01"),
  },
  {
    id: "5",
    type: BillType.Internet,
    start_date: new Date("2025-01-01"),
    end_date: new Date("2025-01-31"),
    price: 59.99,
    data: {},
    created: new Date("2025-02-01"),
    modified: new Date("2025-02-01"),
  },
  {
    id: "6",
    type: BillType.Gas,
    start_date: new Date("2025-01-01"),
    end_date: new Date("2025-01-31"),
    price: 47.3,
    data: {},
    created: new Date("2025-02-01"),
    modified: new Date("2025-02-01"),
  },
  {
    id: "7",
    type: BillType.Gas,
    start_date: new Date("2025-02-01"),
    end_date: new Date("2025-02-28"),
    price: 38.9,
    data: {},
    created: new Date("2025-03-01"),
    modified: new Date("2025-03-01"),
  },
];

export default function BillsPage() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setEditModalOpen(true);
  };

  const handleDelete = (bill: Bill) => {
    setSelectedBill(bill);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: wire up delete API call
    setDeleteModalOpen(false);
    setSelectedBill(null);
  };

  usePageHeader({
    title: "Bills",
    actions: (
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditModalOpen(true)}>
        New
      </Button>
    ),
  });

  const tabs = [
    {
      key: BillType.Electric,
      label: "Electric",
      icon: <ThunderboltOutlined />,
      content: (
        <>
          <UsageChart data={mockBills.filter((b) => b.type === BillType.Electric)} />
          <BillsTable
            data={mockBills.filter((b) => b.type === BillType.Electric)}
            showUsage
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      ),
    },
    {
      key: BillType.Water,
      label: "Water",
      icon: <ExperimentOutlined />,
      content: (
        <>
          <UsageChart data={mockBills.filter((b) => b.type === BillType.Water)} />
          <BillsTable
            data={mockBills.filter((b) => b.type === BillType.Water)}
            showUsage
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      ),
    },
    {
      key: BillType.Internet,
      label: "Internet",
      icon: <WifiOutlined />,
      content: (
        <BillsTable
          data={mockBills.filter((b) => b.type === BillType.Internet)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ),
    },
    {
      key: BillType.Gas,
      label: "Gas",
      icon: <FireOutlined />,
      content: (
        <BillsTable
          data={mockBills.filter((b) => b.type === BillType.Gas)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <>
      <PageTabs
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

      <Modal
        title="New Bill"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setSelectedBill(null); }}
        onOk={() => { setEditModalOpen(false); setSelectedBill(null); }}
        okText="Save"
      >
        <p>Bill form coming soon.</p>
      </Modal>

      <Modal
        title="Delete Bill"
        open={deleteModalOpen}
        onCancel={() => { setDeleteModalOpen(false); setSelectedBill(null); }}
        onOk={handleDeleteConfirm}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this bill? This action cannot be undone.</p>
      </Modal>
    </>
  );
}
