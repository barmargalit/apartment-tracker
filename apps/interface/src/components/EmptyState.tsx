"use client";

import { Button, Empty, Typography } from "antd";
import React from "react";

interface EmptyStateProps {
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      styles={{ image: { height: 60 } }}
      description={
        <Typography.Text type="secondary">{description ?? "No data"}</Typography.Text>
      }
    >
      {actionLabel && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Empty>
  );
}
