"use client";

import {useEffect} from "react";
import {Card, Skeleton, Typography} from "antd";
import {Pie} from "@ant-design/charts";
import {Bill, BillType} from "@xpensive/types";
import {useBillsStore} from "@/store/billsStore";
import {BILL_TYPE_COLOR, BILL_TYPE_LABEL} from "@/lib/billTypes";
import {billDurationMonths, fmtPrice} from "@/lib/billUtils";
import {useTheme} from "@/components/layout/ThemeProvider";

interface SliceItem {
    type: BillType;
    label: string;
    avgPerMonth: number;
    color: string;
}

function buildSlices(bills: Bill[]): SliceItem[] {
    const map = new Map<BillType, Bill[]>();
    for (const bill of bills) {
        map.set(bill.type, [...(map.get(bill.type) ?? []), bill]);
    }

    const items: SliceItem[] = [];
    for (const [type, typeBills] of map.entries()) {
        // sum all bills in the group, divide by the duration of the first bill
        // (all bills in a group are from the same period so duration is the same)
        const totalPrice = typeBills.reduce((s, b) => s + Number(b.price), 0);
        const months = billDurationMonths(typeBills[0].start_date, typeBills[0].end_date, typeBills[0].data);
        items.push({
            type,
            label: BILL_TYPE_LABEL[type] ?? type,
            avgPerMonth: totalPrice / months,
            color: colorHex(type),
        });
    }

    return items.sort((a, b) => b.avgPerMonth - a.avgPerMonth);
}

// Map Ant Design tag color names → actual hex values for the chart
const TAG_COLOR_HEX: Record<string, string> = {
    gold: "#faad14",
    blue: "#1677ff",
    purple: "#722ed1",
    orange: "#fa8c16",
    green: "#52c41a",
    cyan: "#13c2c2",
    red: "#f5222d",
    magenta: "#eb2f96",
    volcano: "#fa541c",
};

function colorHex(type: BillType): string {
    const name = BILL_TYPE_COLOR[type];
    return TAG_COLOR_HEX[name] ?? "#8c8c8c";
}

export default function BillsPieCard() {
    const {lastBills, lastBillsLoading, fetchLastBills} = useBillsStore();
    const {isDark} = useTheme();

    useEffect(() => {
        fetchLastBills();
    }, [fetchLastBills]);

    const slices = buildSlices(lastBills);
    const total = slices.reduce((s, i) => s + i.avgPerMonth, 0);

    return (
        <Card title="Bills Breakdown" style={{flex: 1, minWidth: 0}}>
            {lastBillsLoading ? (
                <Skeleton active paragraph={{rows: 4}}/>
            ) : slices.length === 0 ? (
                <Typography.Text type="secondary">No bills recorded yet.</Typography.Text>
            ) : (
                <Pie
                    data={slices}
                    angleField="avgPerMonth"
                    colorField="label"
                    scale={{color: {range: slices.map((s) => s.color)}}}
                    theme={{type: isDark ? "classicDark" : "classic"}}
                    innerRadius={0.6}
                    // style={{height: 260}}
                    annotations={[
                        {
                            type: "text",
                            style: {
                                text: fmtPrice(total),
                                x: "50%",
                                y: "50%",
                                textAlign: "center",
                                fontWeight: 600,
                                fontSize: 30,
                                fill: isDark ? "#ffffff" : "#000000",
                            },
                        },
                    ]}
                    label={{
                        text: (d: SliceItem) => {
                            const pct = total > 0 ? ((d.avgPerMonth / total) * 100).toFixed(0) : "0";
                            return `${d.label}\n${pct}%`;
                        },
                        style: {fontSize: 12, textAlign: "center", fontWeight: 500},
                    }}
                    tooltip={{
                        items: [
                            (d: SliceItem) => ({
                                name: d.label,
                                value: `${fmtPrice(d.avgPerMonth)}/mo`,
                            }),
                        ],
                    }}
                    legend={{color: {position: "bottom", layout: {justifyContent: "center"}}}}
                />
            )}
        </Card>
    );
}
