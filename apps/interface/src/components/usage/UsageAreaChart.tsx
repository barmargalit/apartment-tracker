"use client";

import {useEffect, useState} from "react";
import {Button, ConfigProvider, DatePicker, Radio, Segmented, Spin, Statistic, theme as antTheme} from "antd";
import {Area} from "@ant-design/charts";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {BillType, Usage} from "@apartment-tracker/types";
import {useUsagesStore} from "@/store/usagesStore";
import {useTheme} from "@/components/layout/ThemeProvider";
import EmptyState from "@/components/shared/EmptyState";
import UsageCompareChart from "./UsageCompareChart";
import {
    ViewMode,
    calcPeriodStats,
    clampRange,
    defaultRange,
    weekStart,
} from "@/lib/usageChartUtils";

dayjs.extend(customParseFormat);

const {RangePicker} = DatePicker;
const CHART_DATE_FORMAT = "DD/MM/YYYY HH:mm";

function buildChartData(data: Usage[], mode: ViewMode) {
    if (mode === "day") {
        const byDay = new Map<string, number>();
        for (const row of data) {
            const day = dayjs(row.datetime).format("DD/MM/YYYY");
            byDay.set(day, (byDay.get(day) ?? 0) + row.usage);
        }
        return Array.from(byDay.entries())
            .sort((a, b) => dayjs(a[0], "DD/MM/YYYY").valueOf() - dayjs(b[0], "DD/MM/YYYY").valueOf())
            .map(([datetime, usage]) => ({datetime, usage: parseFloat(usage.toFixed(3))}));
    }
    if (mode === "week") {
        const byWeek = new Map<string, { sum: number; sunday: Dayjs }>();
        for (const row of data) {
            const sunday = weekStart(dayjs(row.datetime));
            const key = sunday.format("YYYY-MM-DD");
            const existing = byWeek.get(key);
            byWeek.set(key, {sum: (existing?.sum ?? 0) + row.usage, sunday});
        }
        return Array.from(byWeek.values())
            .sort((a, b) => a.sunday.valueOf() - b.sunday.valueOf())
            .map(({sum, sunday}) => ({
                datetime: sunday.format("DD/MM/YYYY"),
                usage: parseFloat(sum.toFixed(3)),
            }));
    }
    return data.map((row) => ({
        datetime: dayjs(row.datetime).format(CHART_DATE_FORMAT),
        usage: row.usage,
    }));
}

interface Props {
    type: BillType;
}

type ChartMode = "chart" | "compare";

export default function UsageAreaChart({type}: Props) {
    const {usages, loading, bounds, fetchByType, fetchBounds} = useUsagesStore();
    const {isDark} = useTheme();
    const {token} = antTheme.useToken();

    const [chartMode, setChartMode] = useState<ChartMode>("chart");
    const [range, setRange] = useState<[Dayjs, Dayjs]>(defaultRange);
    const [viewMode, setViewMode] = useState<ViewMode>("all");

    useEffect(() => {
        fetchBounds(type);
    }, [type]);

    useEffect(() => {
        fetchByType({
            type,
            from: range[0].toISOString(),
            to: range[1].toISOString(),
        });
    }, [type, range]);

    const data: Usage[] = usages[type];
    const isLoading = loading[type];
    const firstEntry = bounds[type]?.first ? dayjs(bounds[type].first) : null;
    const lastEntry = bounds[type]?.last ? dayjs(bounds[type].last) : null;

    const presets = [
        {
            label: "Today",
            value: clampRange(dayjs().startOf("day"), dayjs().endOf("day").startOf("minute"), firstEntry, lastEntry)
        },
        {
            label: "Yesterday",
            value: clampRange(dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day").startOf("minute"), firstEntry, lastEntry)
        },
        {
            label: "Last 7 Days",
            value: clampRange(dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day").startOf("minute"), firstEntry, lastEntry)
        },
        {
            label: "Last Week",
            value: clampRange(weekStart(dayjs().subtract(1, "week")), weekStart(dayjs().subtract(1, "week")).add(6, "day").endOf("day").startOf("minute"), firstEntry, lastEntry)
        },
        {
            label: "Last 30 Days",
            value: clampRange(dayjs().subtract(29, "day").startOf("day"), dayjs().endOf("day").startOf("minute"), firstEntry, lastEntry)
        },
        {
            label: "Last Month",
            value: clampRange(dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month").endOf("day").startOf("minute"), firstEntry, lastEntry)
        },
    ];

    const {totalUsage, nightUsage, dayUsage, averaged, isMultiDay} = calcPeriodStats(data);
    const uniqueWeeks = new Set(data.map((row) => weekStart(dayjs(row.datetime)).format("YYYY-MM-DD")));
    const isMultiWeek = uniqueWeeks.size > 1;
    const chartData = buildChartData(data, viewMode);
    const avgSuffix = averaged ? " avg/day" : "";

    const controls = (
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
            <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                optionType="button"
                buttonStyle="solid"
            >
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="day" disabled={!isMultiDay}>Day</Radio.Button>
                <Radio.Button value="week" disabled={!isMultiWeek}>Week</Radio.Button>
            </Radio.Group>
            <RangePicker
                showTime={{
                    format: "HH:mm",
                    defaultOpenValue: [dayjs().startOf("day"), dayjs().endOf("day").startOf("minute")]
                }}
                format={CHART_DATE_FORMAT}
                value={range}
                onChange={(val) => {
                    if (val) setRange(val as [Dayjs, Dayjs]);
                }}
                presets={presets}
                disabledDate={(date) => {
                    if (firstEntry && date.isBefore(firstEntry, "day")) return true;
                    if (lastEntry && date.isAfter(lastEntry, "day")) return true;
                    return false;
                }}
                allowClear={false}
            />
            <Button onClick={() => setRange(defaultRange())}>Reset</Button>
        </div>
    );

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 16, height: "100%"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <ConfigProvider theme={{components: {Segmented: {itemSelectedBg: token.colorPrimary, itemSelectedColor: token.colorWhite, trackBg: token.colorPrimaryBg}}}}>
                    <Segmented
                        value={chartMode}
                        onChange={(val) => setChartMode(val as ChartMode)}
                        options={[
                            {label: "Single", value: "chart"},
                            {label: "Compare", value: "compare"},
                        ]}
                    />
                </ConfigProvider>
            </div>

            {chartMode === "compare" ? (
                <UsageCompareChart type={type} firstEntry={firstEntry} lastEntry={lastEntry}/>
            ) : isLoading ? (
                <div style={{display: "flex", flex: 1, alignItems: "center", justifyContent: "center"}}>
                    <Spin/>
                </div>
            ) : chartData.length === 0 ? (
                <>
                    <div style={{display: "flex", justifyContent: "flex-end"}}>{controls}</div>
                    <EmptyState description="No usage data"/>
                </>
            ) : (
                <>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <div style={{display: "flex", gap: 48}}>
                            <Statistic title="Total Usage" value={totalUsage} precision={3} suffix="kWh"/>
                            <Statistic title={`Day Usage (07:00–23:00)${avgSuffix}`} value={dayUsage} precision={3}
                                       suffix="kWh"/>
                            <Statistic title={`Night Usage (23:00–07:00)${avgSuffix}`} value={nightUsage} precision={3}
                                       suffix="kWh"/>
                        </div>
                        {controls}
                    </div>
                    <div style={{flex: 1, minHeight: 0}}>
                        <Area
                            height={1000}
                            data={chartData}
                            xField="datetime"
                            yField="usage"
                            theme={{type: isDark ? "classicDark" : "classic"}}
                            axis={{
                                y: {title: "Usage"},
                                x: {label: {autoRotate: true, autoHide: true}},
                            }}
                            style={{fill: "linear-gradient(-90deg, #b0ed8a 0%, #ebd96c 50%, #e33d3d 100%)"}}
                            scale={{y: {domainMin: 0, nice: true}}}
                            tooltip={{title: (d) => d.datetime, items: [{field: "usage", name: "Usage"}]}}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
