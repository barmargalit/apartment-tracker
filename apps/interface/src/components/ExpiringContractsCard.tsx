"use client";

import { useEffect } from "react";
import { Card } from "antd";
import dayjs from "dayjs";
import { useContractsStore } from "@/store/contractsStore";
import ExpiringContractsAlert from "./ExpiringContractsAlert";

export default function ExpiringContractsCard() {
  const { contracts, fetchAll } = useContractsStore();

  useEffect(() => {
    fetchAll();
  }, []);
  const now = dayjs();
  const hasExpiring = contracts.some(
    (c) => c.end_date && dayjs(c.end_date).isAfter(now) && dayjs(c.end_date).isBefore(now.add(2, "month")),
  );

  if (!hasExpiring) return null;

  return (
    <Card title="Alerts">
      <ExpiringContractsAlert />
    </Card>
  );
}
