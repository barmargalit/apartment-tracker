"use client";

import { useState } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import MortgageTrackCollapse, { MortgageTrack, MortgageTrackType } from "./MortgageTrackCollapse";
import MortgageTrackModal from "./MortgageTrackModal";
import { TrackInputs } from "@/lib/mortgageUtils";

interface Props {
  totalLoan: number;
}

export default function MortgagePlanContent({ totalLoan: _totalLoan }: Props) {
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<MortgageTrack | null>(null);
  const [tracks, setTracks] = useState<MortgageTrack[]>([]);

  const handleSaveTrack = (type: MortgageTrackType, inputs: TrackInputs) => {
    if (editingTrack) {
      setTracks((prev) => prev.map((t) => t.id === editingTrack.id ? { ...t, type, inputs } : t));
      setEditingTrack(null);
    } else {
      setTracks((prev) => [...prev, { id: crypto.randomUUID(), type, inputs }]);
    }
  };

  const handleEditTrack = (track: MortgageTrack) => {
    setEditingTrack(track);
    setTrackModalOpen(true);
  };

  const handleDeleteTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setTrackModalOpen(true)}>
          Add Track
        </Button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <MortgageTrackCollapse tracks={tracks} onEdit={handleEditTrack} onDelete={handleDeleteTrack} />
      </div>
      <MortgageTrackModal
        open={trackModalOpen}
        editingTrack={editingTrack}
        onClose={() => { setTrackModalOpen(false); setEditingTrack(null); }}
        onSave={handleSaveTrack}
      />
    </div>
  );
}
