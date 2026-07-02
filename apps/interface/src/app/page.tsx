"use client";

import { usePageHeader } from "@/components/PageHeaderContext";
import LastBillsCard from "@/components/LastBillsCard";
import BillsPieCard from "@/components/BillsPieCard";

export default function HomePage() {
  usePageHeader({ title: "Home" });

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <LastBillsCard />
      <BillsPieCard />
    </div>
  );
}
