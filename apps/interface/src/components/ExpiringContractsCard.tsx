"use client";

import { useEffect } from "react";
import { Alert, Card } from "antd";
import dayjs from "dayjs";
import { useContractsStore } from "@/store/contractsStore";
import { useProvidersStore } from "@/store/providersStore";

export default function ExpiringContractsCard() {
  const { contracts, fetchAll } = useContractsStore();
  const { providers, fetchAll: fetchProviders } = useProvidersStore();

  useEffect(() => {
    fetchAll();
    fetchProviders();
  }, []);

  const providerById = Object.fromEntries(providers.map((p) => [p.id, p]));
  const expiringSoon = contracts.filter((c) => {
    if (!c.end_date) return false;
    const end = dayjs(c.end_date);
    const now = dayjs();
    return end.isAfter(now) && end.isBefore(now.add(2, "month"));
  });

  if (expiringSoon.length === 0) return null;

  return (
    <Card title="Alerts">
      <Alert
        type="warning"
        showIcon
        message={`You have ${expiringSoon.length} contract${expiringSoon.length > 1 ? "s" : ""} expiring in the next 2 months:`}
        description={
          <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
            {expiringSoon.map((c) => (
              <li key={c.id}>
                {providerById[c.provider_id]?.name ?? "Unknown provider"} — ends {dayjs(c.end_date).format("DD/MM/YY")}
              </li>
            ))}
          </ul>
        }
      />
    </Card>
  );
}
