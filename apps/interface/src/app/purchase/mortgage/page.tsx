"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Spin, Tabs, Typography, theme, message } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import CreatePlanModal from "@/components/mortgage/CreatePlanModal";
import MortgagePlanContent from "@/components/mortgage/MortgagePlanContent";
import { usePageHeader } from "@/components/layout/PageHeaderContext";
import { LocalPlan, LocalTrack, deepClone, inputsToApiData, apiTrackToInputs } from "@/lib/mortgageUtils";
import { mortgagePlansApi } from "@/api/mortgagePlansApi";
import { mortgageTracksApi } from "@/api/mortgageTracksApi";
import type { MortgageTrackType } from "@apartment-tracker/types";
import styles from "./mortgage.module.css";

export default function MortgagePage() {
    const { token } = theme.useToken();
    const [plans, setPlans] = useState<LocalPlan[]>([]);
    const [activeKey, setActiveKey] = useState<string | undefined>();
    const [createOpen, setCreateOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Committed snapshot — what's in the DB right now.
    const savedRef = useRef<LocalPlan[]>([]);

    usePageHeader({
        title: "Mortgage",
        actions: (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                Plan
            </Button>
        ),
    });

    useEffect(() => {
        (async () => {
            try {
                const dbPlans = await mortgagePlansApi.fetchAll();
                const loaded: LocalPlan[] = await Promise.all(
                    dbPlans.map(async (p) => {
                        const dbTracks = await mortgageTracksApi.fetchByPlan(p.id);
                        const tracks: LocalTrack[] = dbTracks.map((t) => ({
                            localId: t.id,
                            dbId: t.id,
                            type: t.type as MortgageTrackType,
                            inputs: apiTrackToInputs(t),
                        }));
                        return {
                            localId: p.id,
                            dbId: p.id,
                            totalLoan: Number(p.total_loan),
                            bankId: p.bank_id,
                            tracks,
                        };
                    })
                );
                savedRef.current = deepClone(loaded);
                setPlans(loaded);
                if (loaded.length > 0) setActiveKey(loaded[0].localId);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Dirty = current plans differ from saved snapshot (JSON comparison).
    const isDirty = JSON.stringify(plans) !== JSON.stringify(savedRef.current);

    // Per-plan dirty check.
    const isPlanDirty = (localId: string) => {
        const current = plans.find((p) => p.localId === localId);
        const saved = savedRef.current.find((p) => p.localId === localId);
        return JSON.stringify(current) !== JSON.stringify(saved);
    };

    const handleCreatePlan = (totalLoan: number, bankId?: string | null) => {
        const localId = crypto.randomUUID();
        setPlans((prev) => [...prev, { localId, totalLoan, bankId, tracks: [] }]);
        setActiveKey(localId);
    };

    const handleRemovePlan = (localId: string) => {
        setPlans((prev) => {
            const next = prev.filter((p) => p.localId !== localId);
            if (activeKey === localId) setActiveKey(next.length ? next[next.length - 1].localId : undefined);
            return next;
        });
    };

    const handleTracksChange = (localId: string, tracks: LocalTrack[]) => {
        setPlans((prev) => prev.map((p) => p.localId === localId ? { ...p, tracks } : p));
    };

    const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: "add" | "remove") => {
        if (action === "add") setCreateOpen(true);
        else handleRemovePlan(targetKey as string);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const nextSaved: LocalPlan[] = deepClone(savedRef.current);

            for (const plan of plans) {
                const savedPlan = savedRef.current.find((p) => p.localId === plan.localId);

                // New plan — create it and all its tracks.
                if (!plan.dbId) {
                    const created = await mortgagePlansApi.create({
                        total_loan: plan.totalLoan,
                        bank_id: plan.bankId ?? null,
                    });
                    const savedTracks: LocalTrack[] = [];
                    for (const track of plan.tracks) {
                        const ct = await mortgageTracksApi.create({
                            plan_id: created.id,
                            type: track.type,
                            amount: track.inputs.principal,
                            years: track.inputs.years,
                            months: track.inputs.years * 12,
                            data: inputsToApiData(track.type, track.inputs),
                        });
                        savedTracks.push({ ...track, localId: ct.id, dbId: ct.id });
                    }
                    nextSaved.push({ ...plan, localId: created.id, dbId: created.id, tracks: savedTracks });
                    continue;
                }

                // Existing plan — only touch it if dirty.
                if (!isPlanDirty(plan.localId)) continue;

                // Update plan fields if changed.
                if (
                    savedPlan &&
                    (plan.totalLoan !== savedPlan.totalLoan || plan.bankId !== savedPlan.bankId)
                ) {
                    await mortgagePlansApi.update(plan.dbId, {
                        total_loan: plan.totalLoan,
                        bank_id: plan.bankId ?? null,
                    });
                }

                const savedTracks = savedPlan?.tracks ?? [];
                const savedTrackIds = new Set(savedTracks.map((t) => t.localId));
                const currentTrackIds = new Set(plan.tracks.map((t) => t.localId));

                // Delete removed tracks.
                for (const st of savedTracks) {
                    if (!currentTrackIds.has(st.localId) && st.dbId) {
                        await mortgageTracksApi.delete(st.dbId);
                    }
                }

                const updatedTracks: LocalTrack[] = [];
                for (const track of plan.tracks) {
                    if (!track.dbId) {
                        // New track on existing plan.
                        const ct = await mortgageTracksApi.create({
                            plan_id: plan.dbId!,
                            type: track.type,
                            amount: track.inputs.principal,
                            years: track.inputs.years,
                            months: track.inputs.years * 12,
                            data: inputsToApiData(track.type, track.inputs),
                        });
                        updatedTracks.push({ ...track, localId: ct.id, dbId: ct.id });
                    } else if (savedTrackIds.has(track.localId)) {
                        // Existing track — update only if changed.
                        const st = savedTracks.find((t) => t.localId === track.localId);
                        if (JSON.stringify(track) !== JSON.stringify(st)) {
                            await mortgageTracksApi.update(track.dbId, {
                                type: track.type,
                                amount: track.inputs.principal,
                                years: track.inputs.years,
                                months: track.inputs.years * 12,
                                data: inputsToApiData(track.type, track.inputs),
                            });
                        }
                        updatedTracks.push(track);
                    }
                }

                const idx = nextSaved.findIndex((p) => p.localId === plan.localId);
                if (idx !== -1) nextSaved[idx] = { ...plan, tracks: updatedTracks };
            }

            // Delete plans removed from UI.
            for (const sp of savedRef.current) {
                if (sp.dbId && !plans.find((p) => p.localId === sp.localId)) {
                    await mortgagePlansApi.delete(sp.dbId);
                    const i = nextSaved.findIndex((p) => p.localId === sp.localId);
                    if (i !== -1) nextSaved.splice(i, 1);
                }
            }

            savedRef.current = nextSaved;
            setPlans(deepClone(nextSaved));
            message.success("Saved successfully");
        } catch {
            message.error("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Typography.Text type="secondary">No plans yet. Click "Plan" to get started.</Typography.Text>
                </div>
                <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreatePlan} />
            </>
        );
    }

    return (
        <>
            <Tabs
                type="editable-card"
                activeKey={activeKey}
                onChange={setActiveKey}
                onEdit={onEdit}
                className={styles.planTabs}
                items={plans.map((plan) => ({
                    key: plan.localId,
                    label: (
                        <span>
                            Plan
                            <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                ₪{plan.totalLoan.toLocaleString("he-IL")}
                            </Typography.Text>
                        </span>
                    ),
                    children: (
                        <div style={{ height: "100%", overflowY: "auto" }}>
                            <MortgagePlanContent
                                totalLoan={plan.totalLoan}
                                tracks={plan.tracks}
                                dirty={isPlanDirty(plan.localId)}
                                onChange={(tracks) => handleTracksChange(plan.localId, tracks)}
                            />
                        </div>
                    ),
                }))}
            />

            <div style={{
                position: "fixed",
                bottom: 32,
                right: 32,
                zIndex: 100,
                boxShadow: token.boxShadowSecondary,
                borderRadius: token.borderRadiusLG,
            }}>
                <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={saving}
                    disabled={!isDirty}
                    onClick={handleSave}
                >
                    Save
                </Button>
            </div>

            <CreatePlanModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreatePlan} />
        </>
    );
}
