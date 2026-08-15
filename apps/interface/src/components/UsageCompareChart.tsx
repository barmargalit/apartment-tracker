"use client";

import {useEffect, useRef, useState} from "react";
import {Button, DatePicker, Radio, Spin, Statistic} from "antd";
import {Area} from "@ant-design/charts";
import {PlusOutlined, CloseOutlined} from "@ant-design/icons";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {BillType, Usage} from "@apartment-tracker/types";
import {usagesApi} from "@/api/usagesApi";
import {useTheme} from "./ThemeProvider";
import EmptyState from "./EmptyState";
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

interface CompareRange {
    id: string;
    range: [Dayjs, Dayjs];
    data: Usage[];
    loading: boolean;
}

function rangeLabel(range: [Dayjs, Dayjs]): string {
    return `${range[0].format("DD/MM")} – ${range[1].format("DD/MM")}`;
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

        // "all" — raw readings, x axis = hours offset from range start
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

    // Fetch all ranges when the bill type changes.
    useEffect(() => {
        setRanges((prev) => {
            prev.forEach((r) => fetchRange(r.id, r.range, type));
            return prev;
        });
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
                            onChange={(val) => { if (val) updateRange(r.id, val as [Dayjs, Dayjs]); }}
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

                    <div style={{display: "flex", gap: 32, flexWrap: "wrap"}}>
                        {ranges.map((r, i) => {
                            const stats = calcPeriodStats(r.data);
                            const avgSuffix = stats.averaged ? " avg/day" : "";
                            const nightData = r.data.filter((row) => isNight(dayjs(row.datetime)));
                            const dayData = r.data.filter((row) => !isNight(dayjs(row.datetime)));
                            const nightUsage = stats.isMultiDay
                                ? nightData.reduce((s, row) => s + row.usage, 0) / new Set(r.data.map((row) => dayjs(row.datetime).format("YYYY-MM-DD"))).size
                                : nightData.reduce((s, row) => s + row.usage, 0);
                            const dayUsage = stats.isMultiDay
                                ? dayData.reduce((s, row) => s + row.usage, 0) / new Set(r.data.map((row) => dayjs(row.datetime).format("YYYY-MM-DD"))).size
                                : dayData.reduce((s, row) => s + row.usage, 0);

                            return (
                                <div key={r.id} style={{display: "flex", flexDirection: "column", gap: 4}}>
                                    <span style={{fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4}}>
                                        {i + 1}. {rangeLabel(r.range)}
                                    </span>
                                    <div style={{display: "flex", gap: 32}}>
                                        <Statistic title="Total" value={stats.totalUsage} precision={3} suffix="kWh"/>
                                        <Statistic title={`Day (07:00–23:00)${avgSuffix}`} value={dayUsage} precision={3} suffix="kWh"/>
                                        <Statistic title={`Night (23:00–07:00)${avgSuffix}`} value={nightUsage} precision={3} suffix="kWh"/>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
