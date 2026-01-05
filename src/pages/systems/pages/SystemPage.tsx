import React from "react";
import { Tabs } from "antd";
import AdminManager from "./AdminManager";
import UserManager from "./UserManager";
import RoleManager from "./ProductsManager";
import PermissionManager from "./OrdersManager";
import SettingPage from "./CategoriesManager"; // 🔧 chỉnh lại đường dẫn cho nhất quán

const SystemPage: React.FC = () => {
  const items = [
    {
      key: "users",
      label: "👤 Users",
      children: <UserManager />,
    },

    {
      key: "products",
      label: " products",
      children: <RoleManager />,
    },
    {
      key: "orders",
      label: " Orders",
      children: <PermissionManager />,
    },
    {
      key: "categories",
      label: "⚙️ Category",
      children: <SettingPage />,
    },
  ];

  return (
    <div className='system-page' style={{ padding: 20 }}>
      <h2>⚙️ System Management</h2>
      <Tabs
        defaultActiveKey='users'
        items={items}
        tabBarStyle={{ marginBottom: 20 }}
      />
    </div>
  );
};

export default SystemPage;
