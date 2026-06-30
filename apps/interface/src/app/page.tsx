"use client";

import { usePageHeader } from "@/components/PageHeaderContext";
import LastBillsCard from "@/components/LastBillsCard";

export default function HomePage() {
  usePageHeader({ title: "Home" });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <LastBillsCard />
    </div>
  );
}
