"use client";

import { useEffect } from "react";
import { Card, Divider, Skeleton, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { Bill, BillType, ElectricBillData, WaterBillData } from "@apartment-tracker/types";
import { useBillsStore } from "@/store/billsStore";
import styles from "./LastBillsCard.module.css";

const { Text } = Typography;

const TYPE_COLOR: Record<BillType, string> = {
  [BillType.Electric]: "gold",
  [BillType.Water]: "blue",
  [BillType.Internet]: "purple",
  [BillType.Gas]: "orange",
};

function getPeriod(bill: Bill): string | null {
  const d = bill.data as Partial<ElectricBillData & WaterBillData>;
  if (d.year != null && d.period != null) return `${d.year} P${d.period}`;
  if (d.year != null) return String(d.year);
  return null;
}

function billDurationMonths(bill: Bill): number {
  const d = bill.data as Partial<ElectricBillData & WaterBillData>;
  if (d.period != null) return 2;
  const diff = dayjs(bill.end_date).diff(dayjs(bill.start_date), "day") / 30;
  return diff > 0 ? diff : 1;
}

function monthlyRate(bill: Bill): number {
  return bill.price / billDurationMonths(bill);
}

export default function LastBillsCard() {
  const { lastBills, lastBillsLoading, fetchLastBills } = useBillsStore();

  useEffect(() => {
    fetchLastBills();
  }, [fetchLastBills]);

  const totalPerMonth = lastBills.reduce((sum, b) => sum + monthlyRate(b), 0);

  const tooltipContent = (
    <>
      {lastBills.map((b) => {
        const months = billDurationMonths(b);
        const rate = monthlyRate(b);
        return (
          <div key={b.id}>{b.type}: ₪{Number(b.price).toFixed(2)} ÷ {months}mo = ₪{rate.toFixed(2)}/mo</div>
        );
      })}
    </>
  );

  return (
    <Card title="Last Bills" style={{ width: "50%" }}>
      {lastBillsLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : lastBills.length === 0 ? (
        <Text type="secondary">No bills recorded yet.</Text>
      ) : (
        <>
          <div className={styles.table}>
            {lastBills.map((bill) => {
              const period = getPeriod(bill);
              const dateRange = `${dayjs(bill.start_date).format("DD/MM/YY")} – ${dayjs(bill.end_date).format("DD/MM/YY")}`;
              return (
                <div key={bill.id} className={styles.row}>
                  <div className={styles.typeCell}>
                    <Tag color={TYPE_COLOR[bill.type]} style={{ margin: 0 }}>
                      <span className={styles.type}>{bill.type}</span>
                    </Tag>
                  </div>
                  <span className={styles.meta}>
                    {period ? `${period} · ` : ""}{dateRange}
                  </span>
                  <span className={styles.price}>₪{Number(bill.price).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <Divider className={styles.divider} />
          <div className={styles.sumRow}>
              <Typography.Title level={5} className={styles.sumLabel} style={{ cursor: "default", margin: 0 }}>Avg / month</Typography.Title>
              <Tooltip title={tooltipContent} styles={{ container: { width: "max-content" } }}>
                  <span className={styles.sumValue} style={{borderBottom: "1px dashed"}}>₪{totalPerMonth.toFixed(2)}</span>
              </Tooltip>
          </div>
        </>
      )}
    </Card>
  );
}
