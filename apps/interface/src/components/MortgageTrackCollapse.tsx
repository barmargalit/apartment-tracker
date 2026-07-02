"use client";

import { useState } from "react";
import { Button, Collapse, Modal, Statistic, Typography, theme } from "antd";
import { CaretRightOutlined, DeleteOutlined, EditOutlined, ExpandAltOutlined } from "@ant-design/icons";
import TrackSummary from "./TrackSummary";
import AmortizationTable from "./AmortizationTable";
import { calcAmortization, TrackInputs } from "@/lib/mortgageUtils";
import type { MortgageTrackType } from "@apartment-tracker/types";

export type { MortgageTrackType };

export const TRACK_LABELS: Record<MortgageTrackType, string> = {
    fixed_index_linked: "Fixed Interest, Index-Linked",
    variable_index_linked: "Variable Interest, Index-Linked",
    prime: "Prime Interest Rate",
    fixed_unlinked: "Fixed Interest, Not Index-Linked",
    foreign_currency: "Foreign Currency Linked",
};

export interface MortgageTrack {
    id: string;
    type: MortgageTrackType;
    inputs?: TrackInputs;
}

interface Props {
    tracks: MortgageTrack[];
    onEdit: (track: MortgageTrack) => void;
    onDelete: (id: string) => void;
    planTotalLoan?: number;
}

export default function MortgageTrackCollapse({ tracks, onEdit, onDelete, planTotalLoan }: Props) {
    const { token } = theme.useToken();
    const [expandedTrack, setExpandedTrack] = useState<MortgageTrack | null>(null);

    const panelStyle: React.CSSProperties = {
        marginBottom: 24,
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: "none",
    };

    const configuredTracks = tracks.filter((t) => t.inputs);
    const totalLoan = configuredTracks.reduce((sum, t) => sum + (t.inputs!.principal), 0);
    const longestTerm = configuredTracks.reduce((max, t) => Math.max(max, t.inputs!.years), 0);
    const totalRepayment = configuredTracks.reduce((sum, t) => {
        const rows = calcAmortization(t.type, t.inputs!);
        return sum + rows.reduce((s, r) => s + r.scheduledPayment, 0);
    }, 0);

    const fmt = (n: number) =>
        `₪${n.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (tracks.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Typography.Text type="secondary">No tracks yet. Click "Add Track" to get started.</Typography.Text>
            </div>
        );
    }

    const items = tracks.map((track) => ({
        key: track.id,
        label: (
            <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span>{TRACK_LABELS[track.type]}</span>
                {track.inputs && (
                    <span style={{ display: "flex", gap: 12, color: token.colorTextSecondary, fontSize: 13, fontWeight: "normal" }}>
                        <span>{fmt(track.inputs.principal)}</span>
                        <span>{track.inputs.years} yrs</span>
                        {track.type !== "prime"
                            ? <span>{track.inputs.annualRate ?? 0}%</span>
                            : <span>{(track.inputs.primeRate ?? 0) + (track.inputs.primeSpread ?? 0)}% (P{track.inputs.primeSpread !== undefined && track.inputs.primeSpread >= 0 ? `+${track.inputs.primeSpread}` : track.inputs.primeSpread})</span>
                        }
                    </span>
                )}
            </span>
        ),
        style: panelStyle,
        extra: (
            <div style={{ display: "flex", gap: 2 }} onClick={(e) => e.stopPropagation()}>
                <Button type="text" size="small" icon={<ExpandAltOutlined />} onClick={() => setExpandedTrack(track)} />
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(track)} />
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(track.id)} />
            </div>
        ),
        children: track.inputs
            ? (() => {
                const rows = calcAmortization(track.type, track.inputs!);
                return <TrackSummary type={track.type} inputs={track.inputs!} firstRow={rows[0]} />;
            })()
            : <Typography.Text type="secondary">No inputs yet.</Typography.Text>,
    }));

    return (
        <>
            {configuredTracks.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, padding: "16px 24px", background: token.colorFillAlter, borderRadius: token.borderRadiusLG }}>
                    <Statistic
                        title="Total Loan"
                        value={totalLoan}
                        formatter={() => {
                            if (planTotalLoan === undefined) return <span>{fmt(totalLoan)}</span>;
                            const color = totalLoan === planTotalLoan ? token.colorSuccess : token.colorError;
                            return (
                                <span>
                                    <span style={{ color }}>{fmt(totalLoan)}</span>
                                    <span style={{ fontSize: 14, color: token.colorTextSecondary }}> / {fmt(planTotalLoan)}</span>
                                </span>
                            );
                        }}
                    />
                    <Statistic title="Longest Term" value={longestTerm} suffix={`yrs (${longestTerm * 12} mo)`} />
                    <Statistic title="Total Repayment" value={totalRepayment} prefix="₪" precision={2} />
                    <Statistic title="Total Interest" value={totalRepayment - totalLoan} prefix="₪" precision={2} styles={{ content: { color: token.colorError } }} />
                </div>
            )}
            <Collapse
                bordered={false}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                style={{ background: token.colorBgContainer, overflowY: "auto" }}
                items={items}
            />

            {expandedTrack?.inputs && (() => {
                const rows = calcAmortization(expandedTrack.type, expandedTrack.inputs!);
                return (
                    <Modal
                        open
                        title={TRACK_LABELS[expandedTrack.type]}
                        onCancel={() => setExpandedTrack(null)}
                        footer={null}
                        width="90vw"
                        style={{ top: 24 }}
                        styles={{ body: { height: "80vh", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" } }}
                        destroyOnHidden
                    >
                        <TrackSummary type={expandedTrack.type} inputs={expandedTrack.inputs!} firstRow={rows[0]} />
                        <AmortizationTable rows={rows} />
                    </Modal>
                );
            })()}
        </>
    );
}
