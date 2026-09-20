"use client";

import { usePageHeader } from "@/components/PageHeaderContext";
import LastBillsCard from "@/components/LastBillsCard";
import BillsPieCard from "@/components/BillsPieCard";
import ExpiringContractsCard from "@/components/ExpiringContractsCard";

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
