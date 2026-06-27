"use client";

import { Typography } from "antd";
import { usePageHeader } from "@/components/PageHeaderContext";

const { Paragraph } = Typography;

export default function HomePage() {
  usePageHeader({ title: "Home" });

  return (
    <Paragraph>Welcome to Apartment Tracker.</Paragraph>
  );
}
