"use client";

import { useState } from "react";
import { Button, Tabs, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CreatePlanModal from "@/components/CreatePlanModal";
import MortgagePlanContent from "@/components/MortgagePlanContent";
import { usePageHeader } from "@/components/PageHeaderContext";
import styles from "./mortgage.module.css";

interface MortgagePlan {
  id: string;
  totalLoan: number;
  label: string;
}

export default function MortgagePage() {
  const [plans, setPlans] = useState<MortgagePlan[]>([]);
  const [activeKey, setActiveKey] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [planCount, setPlanCount] = useState(0);

  usePageHeader({
    title: "Mortgage",
    actions: (
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
        Create Plan
      </Button>
    ),
  });

  const handleCreatePlan = (totalLoan: number) => {
    const n = planCount + 1;
    setPlanCount(n);
    const id = crypto.randomUUID();
    const newPlan: MortgagePlan = {
      id,
      totalLoan,
      label: `Plan ${n}`,
    };
    setPlans((prev) => [...prev, newPlan]);
    setActiveKey(id);
  };

  const handleRemovePlan = (targetKey: string) => {
    setPlans((prev) => {
      const next = prev.filter((p) => p.id !== targetKey);
      if (activeKey === targetKey) {
        setActiveKey(next.length ? next[next.length - 1].id : undefined);
      }
      return next;
    });
  };

  const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: "add" | "remove") => {
    if (action === "add") {
      setCreateOpen(true);
    } else {
      handleRemovePlan(targetKey as string);
    }
  };

  if (plans.length === 0) {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <Typography.Text type="secondary">No plans yet. Click "Create Plan" to get started.</Typography.Text>
        </div>
        <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreatePlan} />
      </>
    );
  }

  return (
    <>
      <Tabs
        type="editable-card"
        activeKey={activeKey}
        onChange={setActiveKey}
        onEdit={onEdit}
        className={styles.planTabs}
        items={plans.map((plan) => ({
          key: plan.id,
          label: (
            <span>
              {plan.label}
              <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                ₪{plan.totalLoan.toLocaleString("he-IL")}
              </Typography.Text>
            </span>
          ),
          children: (
            <div style={{ height: "100%", overflowY: "auto" }}>
              <MortgagePlanContent key={plan.id} totalLoan={plan.totalLoan} />
            </div>
          ),
        }))}
      />
      <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreatePlan} />
    </>
  );
}
