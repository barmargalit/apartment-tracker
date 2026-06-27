"use client";

import { Tabs, TabsProps } from "antd";
import styles from "./PageTabs.module.css";

export default function PageTabs(props: TabsProps) {
  return <Tabs className={styles.pageTabs} {...props} />;
}
