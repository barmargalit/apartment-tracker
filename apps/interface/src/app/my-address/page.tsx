"use client";

import { usePageHeader } from "@/components/PageHeaderContext";

export default function MyAddressPage() {
  usePageHeader({ title: "My Address" });

  return <p>My address content.</p>;
}
