"use client";

import PageTabs from "@/components/PageTabs";
import { EyeOutlined, BankOutlined } from "@ant-design/icons";
import { usePageHeader } from "@/components/PageHeaderContext";

const tabs = [
  {
    key: "prospects",
    label: "Prospects",
    icon: <EyeOutlined />,
    content: <p>Prospects content.</p>,
  },
  {
    key: "mortgage",
    label: "Mortgage",
    icon: <BankOutlined />,
    content: <p>Mortgage content.</p>,
  },
];

export default function PurchasePage() {
  usePageHeader({ title: "Purchase" });

  return (
    <PageTabs
      items={tabs.map(({ key, label, icon, content }) => ({
        key,
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {icon}
            {label}
          </span>
        ),
        children: content,
      }))}
    />
  );
}

