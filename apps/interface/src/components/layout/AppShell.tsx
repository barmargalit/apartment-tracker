"use client";

import { Layout, theme } from "antd";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";
import { PageHeaderProvider } from "./PageHeaderContext";

const { Content } = Layout;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { token } = theme.useToken();

  return (
    <PageHeaderProvider>
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <Layout style={{ display: "flex", flexDirection: "column" }}>
          <PageHeader />
          <Content
            style={{
              padding: 24,
              background: token.colorBgContainer,
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </PageHeaderProvider>
  );
}
