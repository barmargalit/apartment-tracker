"use client";

import { useEffect } from "react";
import { Alert } from "antd";
import dayjs from "dayjs";
import { useContractsStore } from "@/store/contractsStore";
import { useProvidersStore } from "@/store/providersStore";
import { BILL_TYPE_LABEL } from "@/lib/billTypes";

interface Props {
  style?: React.CSSProperties;
}

export default function ExpiringContractsAlert({ style }: Props) {
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
    <Alert
      type="warning"
      showIcon
      style={style}
      title={`You have ${expiringSoon.length} contract${expiringSoon.length > 1 ? "s" : ""} expiring in the next 2 months:`}
      description={
        <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
          {expiringSoon.map((c) => (
            <li key={c.id}>
              {[BILL_TYPE_LABEL[c.bill_type], providerById[c.provider_id]?.name, `ends ${dayjs(c.end_date).format("DD/MM/YY")}`].filter(Boolean).join(" · ")}
            </li>
          ))}
        </ul>
      }
    />
  );
}
