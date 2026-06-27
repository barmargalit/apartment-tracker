"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ConfigProvider, Layout, Menu, Popover, Switch, Typography } from "antd";
import {
  HomeOutlined,
  CreditCardOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useTheme } from "./ThemeProvider";
import { colors } from "@/globals";

const { Sider } = Layout;
const { Text } = Typography;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { key: "/", icon: <HomeOutlined />, label: "Home" },
    { key: "/bills", icon: <CreditCardOutlined />, label: "Bills" },
    { key: "/purchase", icon: <ShopOutlined />, label: "Purchase" },
  ];

  const settingsContent = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <BulbOutlined />
      <Text>Dark mode</Text>
      <Switch checked={isDark} onChange={toggleTheme} size="small" />
    </div>
  );

  const siderBg = isDark ? colors.sidebar.bgDark : colors.sidebar.bgLight;
  const settingsColor = isDark ? colors.text.secondaryDark : colors.text.secondaryLight;
  const settingsHoverColor = isDark ? colors.text.dark : colors.text.light;

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{ background: siderBg, boxShadow: `2px 0 8px 0 ${colors.sidebar.shadow}` }}
      theme={isDark ? "dark" : "light"}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: siderBg,
        }}
      >
        <div
          style={{
            height: 48,
            margin: "12px 16px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {collapsed ? (
            <Image
              src="/logo.png"
              alt="Apartment Tracker"
              width={32}
              height={32}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <Image
              src="/logo-sidebar.png"
              alt="Apartment Tracker"
              fill
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemSelectedBg: colors.menu.itemSelectedBg,
                  itemSelectedColor: colors.menu.itemSelectedColor,
                  itemBg: siderBg,
                },
              },
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[pathname]}
              items={menuItems}
              onClick={({ key }) => router.push(key)}
              style={{ background: siderBg, borderInlineEnd: "none" }}
            />
          </ConfigProvider>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "12px 30px" : "12px 24px",
            cursor: "pointer",
            color: pathname === "/my-address" ? colors.menu.itemSelectedColor : settingsColor,
            transition: "color 0.2s",
          }}
          onClick={() => router.push("/my-address")}
          onMouseEnter={(e) => (e.currentTarget.style.color = settingsHoverColor)}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color =
              pathname === "/my-address" ? colors.menu.itemSelectedColor : settingsColor)
          }
        >
          <EnvironmentOutlined style={{ fontSize: 16 }} />
          {!collapsed && <span style={{ fontSize: 14 }}>My Address</span>}
        </div>

        <Popover
          content={settingsContent}
          placement="rightTop"
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          trigger="click"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: collapsed ? "12px 30px" : "12px 24px",
              cursor: "pointer",
              color: settingsColor,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = settingsHoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = settingsColor)}
          >
            <SettingOutlined style={{ fontSize: 16 }} />
            {!collapsed && <span style={{ fontSize: 14 }}>Settings</span>}
          </div>
        </Popover>
      </div>
    </Sider>
  );
}
