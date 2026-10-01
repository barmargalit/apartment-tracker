"use client";

import {useState} from "react";
import {Button, Collapse, InputNumber, Modal, Statistic, Tag, TimePicker, Tooltip, Typography, theme} from "antd";
import {CaretRightOutlined, DeleteOutlined, InfoCircleOutlined, PlusOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {Usage} from "@apartment-tracker/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Plan {
    id: number;
    discount: number;
    discountDays: string[];
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
    usageData: Usage[];
}

function calcAvgDailyUsageBySlot(usageData: Usage[]): Map<string, number> {
    // Key: "Sun-14:30" — avg usage per (dayOfWeek, HH:mm) slot
    const buckets = new Map<string, number[]>();
    for (const row of usageData) {
        const d = dayjs(row.datetime);
        const key = `${DAYS[d.day()]}-${d.hour()}:${String(d.minute()).padStart(2, "0")}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push(row.usage);
    }
    const avgs = new Map<string, number>();
    for (const [key, vals] of buckets.entries()) {
        avgs.set(key, vals.reduce((s, v) => s + v, 0) / vals.length);
    }
    return avgs;
}

function toMinutes(hour: number, minute: number): number {
    return hour * 60 + minute;
}

function calcDailyPrice(
    pricePerKwh: number,
    plan: Plan,
    avgBySlot: Map<string, number>,
): number {
    const startMins = toMinutes(plan.startHour, plan.startMinute);
    const endMins = toMinutes(plan.endHour, plan.endMinute);
    let total = 0;
    for (const day of DAYS) {
        for (const [key, usage] of avgBySlot.entries()) {
            if (!key.startsWith(`${day}-`)) continue;
            const timePart = key.slice(day.length + 1);
            const [h, m] = timePart.split(":").map(Number);
            const slotMins = toMinutes(h, m);
            const overnight = endMins <= startMins;
            const inTimeRange = overnight
                ? slotMins >= startMins || slotMins < endMins
                : slotMins >= startMins && slotMins < endMins;
            const inDiscount = plan.discountDays.includes(day) && inTimeRange;
            const effectivePrice = inDiscount
                ? pricePerKwh * (1 - plan.discount / 100)
                : pricePerKwh;
            total += usage * effectivePrice;
        }
    }
    return total / 7;
}

function calcAvgDailyKwh(avgBySlot: Map<string, number>): number {
    const totalPerWeek = Array.from(avgBySlot.values()).reduce((s, v) => s + v, 0);
    return totalPerWeek / 7;
}

let nextId = 1;

function newPlan(): Plan {
    return {id: nextId++, discount: 0, discountDays: [], startHour: 0, startMinute: 0, endHour: 0, endMinute: 0};
}

export default function SimulatorModal({open, onClose, usageData}: Props) {
    const {token} = theme.useToken();
    const [pricePerKwh, setPricePerKwh] = useState<number>(0);
    const [plans, setPlans] = useState<Plan[]>([newPlan()]);
    const [activeKeys, setActiveKeys] = useState<string[]>([String(plans[0].id)]);

    const avgBySlot = calcAvgDailyUsageBySlot(usageData);
    const avgDailyKwh = calcAvgDailyKwh(avgBySlot);

    const updatePlan = (id: number, patch: Partial<Plan>) => {
        setPlans((prev) => prev.map((p) => p.id === id ? {...p, ...patch} : p));
    };

    const addPlan = () => {
        const p = newPlan();
        setPlans((prev) => [...prev, p]);
        setActiveKeys((prev) => [...prev, String(p.id)]);
    };

    const deletePlan = (id: number) => {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        setActiveKeys((prev) => prev.filter((k) => k !== String(id)));
    };

    const panelStyle: React.CSSProperties = {
        marginBottom: 12,
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: "none",
    };

    const planPrices = plans.map((plan) => calcDailyPrice(pricePerKwh, plan, avgBySlot));
    const minPlanPrice = Math.min(...planPrices);

    const items = plans.map((plan, idx) => {
        const dailyPrice = planPrices[idx];
        const isCheapest = plans.length > 1 && dailyPrice === minPlanPrice;
        return {
            key: String(plan.id),
            style: {
                ...panelStyle,
                ...(isCheapest ? {boxShadow: `0px 0px 10px 2px ${token.colorSuccess}`} : {}),
            },
            label: (
                <span style={{display: "flex", alignItems: "center", gap: 12}}>
                    <span>Plan {idx + 1}</span>
                    {plan.discountDays.length > 0 && (
                        <span style={{color: token.colorTextSecondary, fontSize: 13, fontWeight: "normal"}}>
                            {plan.discount}% off · {plan.discountDays.join(", ")} · {String(plan.startHour).padStart(2, "0")}:{String(plan.startMinute).padStart(2, "0")}–{String(plan.endHour).padStart(2, "0")}:{String(plan.endMinute).padStart(2, "0")}{toMinutes(plan.endHour, plan.endMinute) <= toMinutes(plan.startHour, plan.startMinute) ? " (overnight)" : ""}
                        </span>
                    )}
                </span>
            ),
            extra: (
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined/>}
                        disabled={plans.length === 1}
                        onClick={() => deletePlan(plan.id)}
                    />
                </div>
            ),
            children: (
                <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                    <div style={{display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end"}}>
                        <div>
                            <Typography.Text type="secondary" style={{display: "block", marginBottom: 4}}>Discount
                                (%)</Typography.Text>
                            <InputNumber
                                min={0}
                                max={100}
                                value={plan.discount}
                                onChange={(v) => updatePlan(plan.id, {discount: v ?? 0})}
                                suffix="%"
                                style={{width: 120}}
                            />
                        </div>
                        <div>
                            <Typography.Text type="secondary" style={{display: "block", marginBottom: 4}}>Discount
                                Days</Typography.Text>
                            <Tag.CheckableTagGroup
                                multiple
                                options={DAYS.map((d) => ({value: d, label: d}))}
                                value={plan.discountDays}
                                onChange={(v) => updatePlan(plan.id, {discountDays: v as string[]})}
                            />
                        </div>
                        <div>
                            <Typography.Text type="secondary" style={{display: "block", marginBottom: 4}}>
                                Discount Hours
                                {toMinutes(plan.endHour, plan.endMinute) <= toMinutes(plan.startHour, plan.startMinute) && plan.startHour + plan.startMinute + plan.endHour + plan.endMinute > 0 && (
                                    <Typography.Text type="warning"
                                                     style={{marginLeft: 8, fontSize: 12}}>overnight</Typography.Text>
                                )}
                            </Typography.Text>
                            <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                <TimePicker
                                    format="HH:mm"
                                    showNow={false}
                                    needConfirm={false}
                                    placeholder="Start"
                                    value={dayjs().hour(plan.startHour).minute(plan.startMinute).second(0)}
                                    onChange={(v) => updatePlan(plan.id, {
                                        startHour: v ? v.hour() : 0,
                                        startMinute: v ? v.minute() : 0
                                    })}
                                    style={{width: 90}}
                                />
                                <Typography.Text type="secondary">→</Typography.Text>
                                <TimePicker
                                    format="HH:mm"
                                    showNow={false}
                                    needConfirm={false}
                                    placeholder="End"
                                    value={dayjs().hour(plan.endHour).minute(plan.endMinute).second(0)}
                                    onChange={(v) => updatePlan(plan.id, {
                                        endHour: v ? v.hour() : 0,
                                        endMinute: v ? v.minute() : 0
                                    })}
                                    style={{width: 90}}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ),
        };
    });

    return (
        <Modal
            title="Simulator"
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            destroyOnHidden
        >
            <div style={{display: "flex", flexDirection: "column", gap: 16}}>
                <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between"}}>
                    <div style={{display: "flex", alignItems: "flex-end", gap: 24}}>
                        <div>
                            <Typography.Text type="secondary" style={{display: "block", marginBottom: 4}}>Price per kWh
                                (₪)</Typography.Text>
                            <InputNumber
                                min={0}
                                step={0.01}
                                value={pricePerKwh}
                                onChange={(v) => setPricePerKwh(v ?? 0)}
                                prefix="₪"
                                style={{width: 160}}
                            />
                        </div>
                        <Statistic
                            title="Avg Daily Usage"
                            value={avgDailyKwh}
                            precision={3}
                            suffix="kWh"
                        />
                    </div>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={addPlan}>
                        Add Plan
                    </Button>
                </div>

                <div style={{
                    padding: "12px 16px",
                    background: token.colorFillAlter,
                    borderRadius: token.borderRadiusLG
                }}>
                    <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 12}}>
                        <Typography.Text style={{fontWeight: 500}}>Est. Daily Price</Typography.Text>
                        <Tooltip
                            title="Calculated using the average usage per day-of-week and time slot from your data. For each slot, the full price per kWh is applied — except when the slot falls within a plan's discount window (matching day + hours), where the discounted rate is used. The total is then averaged across all 7 days of the week.">
                            <InfoCircleOutlined style={{color: "var(--ant-color-text-secondary)", cursor: "help"}}/>
                        </Tooltip>
                    </div>
                    <div style={{display: "flex"}}>
                        {plans.map((plan, idx) => {
                            const isCheapest = plans.length > 1 && planPrices[idx] === minPlanPrice;
                            return (
                                <div key={plan.id} style={{flex: 1}}>
                                    <Statistic
                                        title={`Plan ${idx + 1}`}
                                        value={planPrices[idx]}
                                        precision={4}
                                        prefix="₪"
                                        styles={isCheapest ? {content: {color: token.colorSuccess}} : undefined}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Collapse
                    bordered={false}
                    activeKey={activeKeys}
                    onChange={(keys) => setActiveKeys(keys as string[])}
                    expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 0}/>}
                    style={{background: token.colorBgContainer}}
                    items={items}
                />
            </div>
        </Modal>
    );
}
