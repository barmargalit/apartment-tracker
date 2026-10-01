"use client";

import {useState} from "react";
import {Alert, Button} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import MortgageTrackCollapse, {MortgageTrack, MortgageTrackType} from "./MortgageTrackCollapse";
import MortgageTrackModal from "./MortgageTrackModal";
import {TrackInputs, LocalTrack} from "@/lib/mortgageUtils";

interface Props {
    totalLoan: number;
    tracks: LocalTrack[];
    dirty: boolean;
    onChange: (tracks: LocalTrack[]) => void;
}

export default function MortgagePlanContent({totalLoan, tracks, dirty, onChange}: Props) {
    const [trackModalOpen, setTrackModalOpen] = useState(false);
    const [editingTrack, setEditingTrack] = useState<MortgageTrack | null>(null);

    const uiTracks: MortgageTrack[] = tracks.map((t) => ({
        id: t.localId,
        type: t.type,
        inputs: t.inputs,
    }));

    const handleSaveTrack = (type: MortgageTrackType, inputs: TrackInputs) => {
        if (editingTrack) {
            onChange(tracks.map((t) =>
                t.localId === editingTrack.id ? {...t, type, inputs} : t
            ));
            setEditingTrack(null);
        } else {
            onChange([...tracks, {localId: crypto.randomUUID(), type, inputs}]);
        }
    };

    const handleEditTrack = (track: MortgageTrack) => {
        setEditingTrack(track);
        setTrackModalOpen(true);
    };

    const handleDeleteTrack = (localId: string) => {
        onChange(tracks.filter((t) => t.localId !== localId));
    };

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
            <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 16}}>
                {dirty && (
                    <Alert
                        type="warning"
                        showIcon
                        title="You have unsaved changes. Click Save to persist them."
                        style={{flex: 1}}
                        // banner
                    />
                )}
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => setTrackModalOpen(true)}>
                    Track
                </Button>
            </div>
            <div style={{flex: 1, overflowY: "auto"}}>
                <MortgageTrackCollapse
                    tracks={uiTracks}
                    onEdit={handleEditTrack}
                    onDelete={handleDeleteTrack}
                    planTotalLoan={totalLoan}
                />
            </div>
            <MortgageTrackModal
                open={trackModalOpen}
                editingTrack={editingTrack}
                onClose={() => {
                    setTrackModalOpen(false);
                    setEditingTrack(null);
                }}
                onSave={handleSaveTrack}
            />
        </div>
    );
}
