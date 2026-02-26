import React from "react";
import { Tabs } from "antd";
import { useSearchParams } from "react-router-dom";

import "../styles/systempage.scss";
import UserManager from "./UserManager";
import RoleManager from "./ProductsManager";
import PermissionManager from "./OrdersManager";
import SettingPage from "./CategoriesManager";
import DashboardCharts from "./dashboardCharts";

const SystemPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validKeys = ["dashboard", "users", "products", "orders", "categories"] as const;

  type TabKey = (typeof validKeys)[number];
  const isTabKey = (key: string | null): key is TabKey =>
    !!key && (validKeys as readonly string[]).includes(key);

  const activeKey: TabKey = isTabKey(tabParam) ? tabParam : "dashboard";

  const items = [
    {
      key: "dashboard",
      label: "📊 Dashboard",
      children: <DashboardCharts />,
    },
    {
      key: "users",
      label: "👤 Users",
      children: <UserManager />,
    },
    {
      key: "products",
      label: "📦 Products",
      children: <RoleManager />,
    },
    {
      key: "orders",
      label: "🛒 Orders",
      children: <PermissionManager />,
    },
    {
      key: "categories",
      label: "⚙️ Category",
      children: <SettingPage />,
    },
  ];

  return (
    <div className="system-page">
      <h2 className="system-page__title">⚙️ System Management</h2>
      <Tabs
        activeKey={activeKey}
        items={items}
        onChange={(key) => {
          const next = new URLSearchParams(searchParams);
          next.set("tab", key);
          setSearchParams(next, { replace: true });
        }}
      />
    </div>
  );
};

export default SystemPage;
