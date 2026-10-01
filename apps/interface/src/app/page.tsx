"use client";

import { usePageHeader } from "@/components/layout/PageHeaderContext";
import LastBillsCard from "@/components/bills/LastBillsCard";
import BillsPieCard from "@/components/bills/BillsPieCard";
import ExpiringContractsCard from "@/components/contracts/ExpiringContractsCard";

export default function HomePage() {
  usePageHeader({ title: "Home" });

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <LastBillsCard />
        <BillsPieCard />
      </div>
      <div style={{ flex: 1 }}>
        <ExpiringContractsCard />
      </div>
    </div>
  );
}
