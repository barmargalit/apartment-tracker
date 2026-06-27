"use client";

import { theme, Typography } from "antd";
import { usePageHeaderContext } from "./PageHeaderContext";

const { Text } = Typography;

export default function PageHeader() {
  const { title, actions } = usePageHeaderContext();
  const { token } = theme.useToken();

  return (
    <div
      style={{
        height: 48,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        flexShrink: 0,
      }}
    >
      <Text strong style={{ fontSize: 16 }}>
        {title}
      </Text>
      <div style={{ display: "flex", gap: 8 }}>{actions}</div>
    </div>
  );
}
