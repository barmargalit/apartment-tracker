"use client";

import React, {useEffect, useRef, useState} from "react";
import {Button, DatePicker, Radio, Spin, Table, theme as antTheme} from "antd";
import {Area} from "@ant-design/charts";
import {PlusOutlined, CloseOutlined} from "@ant-design/icons";
import type {TableColumnsType} from "antd";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {BillType, Usage} from "@apartment-tracker/types";
import {usagesApi} from "@/api/usagesApi";
import {usePricesStore} from "@/store/pricesStore";
import {useTheme} from "@/components/layout/ThemeProvider";
import EmptyState from "@/components/shared/EmptyState";
import {
    ViewMode,
    calcPeriodStats,
    clampRange,
    isNight,
    weekStart,
} from "@/lib/usageChartUtils";

dayjs.extend(customParseFormat);

const {RangePicker} = DatePicker;
const DATE_FORMAT = "DD/MM/YYYY HH:mm";
const MAX_RANGES = 5;

const UNIT: Partial<Record<BillType, string>> = {
    [BillType.Electric]: "kWh",
    [BillType.Water]: "m³",
    [BillType.Gas]: "m³",
};

interface CompareRange {
    id: string;
    range: [Dayjs, Dayjs];
    data: Usage[];
    loading: boolean;
}

interface RangeStats {
    total: number;
    day: number;
    night: number;
    averaged: boolean;
}

interface MetricRow {
    key: string;
    metric: string;
    values: number[];
}

function rangeLabel(range: [Dayjs, Dayjs]): string {
    return `${range[0].format("DD/MM")} – ${range[1].format("DD/MM")}`;
}

function computeRangeStats(data: Usage[]): RangeStats {
    const stats = calcPeriodStats(data);
    const uniqueDays = new Set(data.map((row) => dayjs(row.datetime).format("YYYY-MM-DD"))).size;
    const divisor = stats.isMultiDay ? uniqueDays : 1;
    const nightData = data.filter((row) => isNight(dayjs(row.datetime)));
    const dayData = data.filter((row) => !isNight(dayjs(row.datetime)));
    return {
        total: stats.totalUsage,
        day: dayData.reduce((s, row) => s + row.usage, 0) / divisor,
        night: nightData.reduce((s, row) => s + row.usage, 0) / divisor,
        averaged: stats.averaged,
    };
}

function buildCompareChartData(ranges: CompareRange[], mode: ViewMode) {
    return ranges.flatMap(({range, data}) => {
        const label = rangeLabel(range);
        const origin = range[0].startOf("day");

        if (mode === "day") {
            const byDay = new Map<number, number>();
            for (const row of data) {
                const offset = dayjs(row.datetime).startOf("day").diff(origin, "day");
                byDay.set(offset, (byDay.get(offset) ?? 0) + row.usage);
            }
            return Array.from(byDay.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([offset, usage]) => ({
                    offset: `Day ${offset + 1}`,
                    usage: parseFloat(usage.toFixed(3)),
                    series: label,
                }));
        }

        if (mode === "week") {
            const byWeek = new Map<number, number>();
            for (const row of data) {
                const offset = weekStart(dayjs(row.datetime)).diff(weekStart(origin), "week");
                byWeek.set(offset, (byWeek.get(offset) ?? 0) + row.usage);
            }
            return Array.from(byWeek.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([offset, usage]) => ({
                    offset: `Week ${offset + 1}`,
                    usage: parseFloat(usage.toFixed(3)),
                    series: label,
                }));
        }

        return data.map((row) => ({
            offset: `+${Math.round(dayjs(row.datetime).diff(origin, "hour"))}h`,
            usage: row.usage,
            series: label,
        }));
    });
}

interface Props {
    type: BillType;
    firstEntry: Dayjs | null;
    lastEntry: Dayjs | null;
}

let nextId = 1;

export default function UsageCompareChart({type, firstEntry, lastEntry}: Props) {
    const {isDark} = useTheme();
    const {token} = antTheme.useToken();
    const {current: currentPrices, fetchCurrentByType} = usePricesStore();
    const [viewMode, setViewMode] = useState<ViewMode>("day");

    const [ranges, setRanges] = useState<CompareRange[]>(() => [
        {
            id: String(nextId++),
            range: [dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day").startOf("minute")],
            data: [],
            loading: false,
        },
        {
            id: String(nextId++),
            range: [dayjs().subtract(13, "day").startOf("day"), dayjs().subtract(7, "day").endOf("day").startOf("minute")],
            data: [],
            loading: false,
        },
    ]);

    const typeRef = useRef(type);
    typeRef.current = type;

    const fetchRange = async (id: string, range: [Dayjs, Dayjs], currentType: BillType) => {
        setRanges((prev) => prev.map((r) => (r.id === id ? {...r, loading: true} : r)));
        try {
            const data = await usagesApi.fetchByType({
                type: currentType,
                from: range[0].toISOString(),
                to: range[1].toISOString(),
            });
            setRanges((prev) => prev.map((r) => (r.id === id ? {...r, data, loading: false} : r)));
        } catch {
            setRanges((prev) => prev.map((r) => (r.id === id ? {...r, loading: false} : r)));
        }
    };

    useEffect(() => {
        setRanges((prev) => {
            prev.forEach((r) => fetchRange(r.id, r.range, type));
            return prev;
        });
        fetchCurrentByType(type);
    }, [type]);

    const updateRange = (id: string, newRange: [Dayjs, Dayjs]) => {
        setRanges((prev) => prev.map((r) => (r.id === id ? {...r, range: newRange} : r)));
        fetchRange(id, newRange, typeRef.current);
    };

    const addRange = () => {
        const id = String(nextId++);
        const newRange: [Dayjs, Dayjs] = [
            dayjs().subtract(6, "day").startOf("day"),
            dayjs().endOf("day").startOf("minute"),
        ];
        setRanges((prev) => [...prev, {id, range: newRange, data: [], loading: false}]);
        fetchRange(id, newRange, typeRef.current);
    };

    const removeRange = (id: string) => {
        setRanges((prev) => prev.filter((r) => r.id !== id));
    };

    const disabledDate = (date: Dayjs) => {
        if (firstEntry && date.isBefore(firstEntry, "day")) return true;
        if (lastEntry && date.isAfter(lastEntry, "day")) return true;
        return false;
    };

    const chartData = buildCompareChartData(ranges, viewMode);
    const allLoading = ranges.every((r) => r.loading);
    const anyData = ranges.some((r) => r.data.length > 0);

    const hasMultiDay = ranges.some((r) => {
        const uniqueDays = new Set(r.data.map((row) => dayjs(row.datetime).format("YYYY-MM-DD")));
        return uniqueDays.size > 1;
    });
    const hasMultiWeek = ranges.some((r) => {
        const uniqueWeeks = new Set(r.data.map((row) => weekStart(dayjs(row.datetime)).format("YYYY-MM-DD")));
        return uniqueWeeks.size > 1;
    });

    const unit = UNIT[type] ?? "kWh";
    const statsPerRange = ranges.map((r) => computeRangeStats(r.data));

    const metricRows: MetricRow[] = [
        {key: "total", metric: "Total", values: statsPerRange.map((s) => s.total)},
        {key: "day", metric: "Day (07:00–23:00)", values: statsPerRange.map((s) => s.day)},
        {key: "night", metric: "Night (23:00–07:00)", values: statsPerRange.map((s) => s.night)},
    ];

    const tableColumns: TableColumnsType<MetricRow> = [
        {
            title: "Metric",
            dataIndex: "metric",
            key: "metric",
            width: 180,
        },
        ...ranges.map((r, i) => ({
            title: (
                <span>
                    <span style={{color: token.colorTextSecondary, marginRight: 4}}>{i + 1}.</span>
                    {rangeLabel(r.range)}
                    {statsPerRange[i].averaged && (
                        <span style={{color: token.colorTextSecondary, fontSize: 11, marginLeft: 4}}>(avg/day)</span>
                    )}
                </span>
            ),
            key: r.id,
            render: (_: unknown, row: MetricRow) =>
                r.loading ? (
                    <Spin size="small"/>
                ) : (
                    `${row.values[i].toFixed(3)} ${unit}`
                ),
        })),
        ...(ranges.length === 2
            ? (() => {
                const isFirstEarlier = ranges[0].range[0].isBefore(ranges[1].range[0]);
                const earlierIdx = isFirstEarlier ? 0 : 1;
                const laterIdx = isFirstEarlier ? 1 : 0;
                const fromLabel = rangeLabel(ranges[earlierIdx].range);
                const toLabel = rangeLabel(ranges[laterIdx].range);
                const currentPrice = currentPrices[type] ? Number(currentPrices[type]!.price) : null;

                const renderDelta = (row: MetricRow): {delta: number; node: React.ReactNode} => {
                    if (ranges[0].loading || ranges[1].loading) return {delta: 0, node: <Spin size="small"/>};
                    const earlier = row.values[earlierIdx];
                    const later = row.values[laterIdx];
                    const delta = later - earlier;
                    const pct = earlier !== 0 ? (delta / earlier) * 100 : null;
                    if (delta === 0) return {delta: 0, node: <span style={{color: token.colorTextSecondary}}>No change</span>};
                    const isIncrease = delta > 0;
                    const color = isIncrease ? token.colorError : token.colorSuccess;
                    const arrow = isIncrease ? "↑" : "↓";
                    const sign = isIncrease ? "+" : "";
                    return {
                        delta,
                        node: (
                            <span style={{color}}>
                                {arrow} {sign}{delta.toFixed(3)} {unit}
                                {pct !== null && (
                                    <span style={{fontSize: 12, marginLeft: 4}}>
                                        ({sign}{pct.toFixed(1)}%)
                                    </span>
                                )}
                            </span>
                        ),
                    };
                };

                return [
                    {
                        title: (
                            <span>
                                Change
                                <span style={{color: token.colorTextSecondary, fontSize: 11, display: "block"}}>
                                    {fromLabel} → {toLabel}
                                </span>
                            </span>
                        ),
                        key: "change",
                        render: (_: unknown, row: MetricRow) => renderDelta(row).node,
                    },
                    ...(currentPrice !== null ? [{
                        title: (
                            <span>
                                Cost Diff
                                <span style={{color: token.colorTextSecondary, fontSize: 11, display: "block"}}>
                                    @ ₪{currentPrice.toFixed(4)}/{unit}
                                </span>
                            </span>
                        ),
                        key: "cost_diff",
                        render: (_: unknown, row: MetricRow) => {
                            if (ranges[0].loading || ranges[1].loading) return <Spin size="small"/>;
                            const result = renderDelta(row);
                            if (result.delta === 0) return <span style={{color: token.colorTextSecondary}}>No change</span>;
                            const cost = result.delta! * currentPrice;
                            const isIncrease = cost > 0;
                            const color = isIncrease ? token.colorError : token.colorSuccess;
                            const arrow = isIncrease ? "↑" : "↓";
                            const sign = isIncrease ? "+" : "";
                            return (
                                <span style={{color}}>
                                    {arrow} {sign}₪{Math.abs(cost).toFixed(2)}
                                </span>
                            );
                        },
                    }] : []),
                ];
            })()
            : []),
    ];

    const controls = (
        <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
            <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                optionType="button"
                buttonStyle="solid"
            >
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="day" disabled={!hasMultiDay}>Day</Radio.Button>
                <Radio.Button value="week" disabled={!hasMultiWeek}>Week</Radio.Button>
            </Radio.Group>
            <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
                {ranges.map((r, i) => (
                    <div key={r.id} style={{display: "flex", alignItems: "center", gap: 4}}>
                        <span style={{color: "var(--color-text-secondary)", fontSize: 12}}>
                            {i + 1}.
                        </span>
                        <RangePicker
                            showTime={{format: "HH:mm", defaultOpenValue: [dayjs().startOf("day"), dayjs().endOf("day").startOf("minute")]}}
                            format={DATE_FORMAT}
                            value={r.range}
                            onChange={(val) => {
                                if (val) updateRange(r.id, val as [Dayjs, Dayjs]);
                            }}
                            disabledDate={disabledDate}
                            allowClear={false}
                        />
                        {ranges.length > 1 && (
                            <Button
                                size="small"
                                type="text"
                                icon={<CloseOutlined/>}
                                onClick={() => removeRange(r.id)}
                            />
                        )}
                        {r.loading && <Spin size="small"/>}
                    </div>
                ))}
                {ranges.length < MAX_RANGES && (
                    <Button icon={<PlusOutlined/>} onClick={addRange}>
                        Add Range
                    </Button>
                )}
            </div>
        </div>
    );

    if (allLoading) {
        return (
            <div style={{display: "flex", flex: 1, alignItems: "center", justifyContent: "center"}}>
                <Spin/>
            </div>
        );
    }

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 16, flex: 1}}>
            {controls}

            {!anyData ? (
                <EmptyState description="No usage data for the selected ranges"/>
            ) : (
                <>
                    <div style={{flex: 1, minHeight: 0}}>
                        <Area
                            height={600}
                            data={chartData}
                            xField="offset"
                            yField="usage"
                            colorField="series"
                            stack={false}
                            theme={{type: isDark ? "classicDark" : "classic"}}
                            axis={{
                                y: {title: "Usage"},
                                x: {label: {autoRotate: true, autoHide: true}},
                            }}
                            scale={{y: {domainMin: 0, nice: true}}}
                            tooltip={{
                                title: (d) => d.offset,
                                items: [{field: "usage", name: "Usage"}, {field: "series", name: "Range"}],
                            }}
                        />
                    </div>

                    <Table<MetricRow>
                        dataSource={metricRows}
                        columns={tableColumns}
                        rowKey="key"
                        pagination={false}
                        size="middle"
                    />
                </>
            )}
        </div>
    );
}
