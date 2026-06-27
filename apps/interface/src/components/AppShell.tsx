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
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Layout style={{ display: "flex", flexDirection: "column" }}>
          <PageHeader />
          <Content
            style={{
              padding: 24,
              background: token.colorBgContainer,
              flex: 1,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </PageHeaderProvider>
  );
}
