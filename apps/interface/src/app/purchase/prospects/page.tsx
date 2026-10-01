"use client";

import { useState } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ProspectsTable from "@/components/prospects/ProspectsTable";
import { usePageHeader } from "@/components/layout/PageHeaderContext";

export default function ProspectsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  usePageHeader({
    title: "Prospects",
    actions: (
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
        New
      </Button>
    ),
  });

  return (
    <ProspectsTable createOpen={createOpen} onCreateClose={() => setCreateOpen(false)} />
  );
}
