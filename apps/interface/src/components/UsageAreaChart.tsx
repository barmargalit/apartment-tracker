"use client";

import {useEffect, useState} from "react";
import {Button, DatePicker, Radio, Spin, Statistic} from "antd";
import {Area} from "@ant-design/charts";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {BillType, Usage} from "@apartment-tracker/types";
import {useUsagesStore} from "@/store/usagesStore";
import {useTheme} from "./ThemeProvider";
import EmptyState from "./EmptyState";

dayjs.extend(customParseFormat);

const {RangePicker} = DatePicker;
const CHART_DATE_FORMAT = "DD/MM/YYYY HH:mm";

type ViewMode = "all" | "day";

function isNight(dt: Dayjs): boolean {
    const h = dt.hour();
    return h >= 23 || h < 7;
}

function calcPeriodStats(data: Usage[]) {
    const totalUsage = data.reduce((sum, row) => sum + row.usage, 0);
    const uniqueDates = new Set(data.map((row) => dayjs(row.datetime).format("YYYY-MM-DD")));
    const isMultiDay = uniqueDates.size > 1;
    const nightTotal = data.filter((row) => isNight(dayjs(row.datetime))).reduce((sum, row) => sum + row.usage, 0);
    const dayTotal = data.filter((row) => !isNight(dayjs(row.datetime))).reduce((sum, row) => sum + row.usage, 0);

    if (isMultiDay) {
        return {
            totalUsage,
            nightUsage: nightTotal / uniqueDates.size,
            dayUsage: dayTotal / uniqueDates.size,
            averaged: true,
            isMultiDay
        };
    }
    return {totalUsage, nightUsage: nightTotal, dayUsage: dayTotal, averaged: false, isMultiDay};
}

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
    return data.map((row) => ({
        datetime: dayjs(row.datetime).format(CHART_DATE_FORMAT),
        usage: row.usage,
    }));
}

interface Props {
    type: BillType;
}

export default function UsageAreaChart({type}: Props) {
    const {usages, loading, fetchByType} = useUsagesStore();
    const {isDark} = useTheme();

    const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("all");

    useEffect(() => {
        fetchByType({
            type,
            from: range?.[0].toISOString(),
            to: range?.[1].toISOString(),
        });
    }, [type, range]);

    const data: Usage[] = usages[type];
    const isLoading = loading[type];

    const {totalUsage, nightUsage, dayUsage, averaged, isMultiDay} = calcPeriodStats(data);
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
            </Radio.Group>
            <RangePicker
                showTime={{format: "HH:mm"}}
                format={CHART_DATE_FORMAT}
                value={range}
                onChange={(val) => setRange(val as [Dayjs, Dayjs] | null)}
                allowClear
            />
            <Button disabled={!range} onClick={() => setRange(null)}>Clear</Button>
        </div>
    );

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 16, height: "100%"}}>
            {isLoading ? (
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
