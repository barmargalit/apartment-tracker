"use client";

import { Popover, Space } from "antd";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import { colors } from "@/globals";

interface Props {
  pros: string[];
  cons: string[];
  children: React.ReactNode;
}

function ProsConsList({ items, color, emptyLabel }: { items: string[]; color: string; emptyLabel: string }) {
  if (items.length === 0) {
    return <span style={{ color: colors.text.secondaryLight }}>{emptyLabel}</span>;
  }
  return (
    <ul style={{ margin: 0, paddingLeft: 18, color }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function ProsConsPopover({ pros, cons, children }: Props) {
  if (pros.length === 0 && cons.length === 0) {
    return <>{children}</>;
  }

  const content = (
    <div style={{ display: "flex", gap: 24, maxWidth: 400 }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: colors.semantic.pro, fontWeight: 600, marginBottom: 4 }}>
          <LikeOutlined /> Pros
        </div>
        <ProsConsList items={pros} color={colors.semantic.pro} emptyLabel="No pros listed" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: colors.semantic.con, fontWeight: 600, marginBottom: 4 }}>
          <DislikeOutlined /> Cons
        </div>
        <ProsConsList items={cons} color={colors.semantic.con} emptyLabel="No cons listed" />
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="hover">
      {children}
    </Popover>
  );
}
