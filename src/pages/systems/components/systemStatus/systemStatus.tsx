import React from "react";
import { Tag } from "antd";

interface SystemStatusProps {
  status: "active" | "inactive" | "error" | "pending";
}

const SystemStatus: React.FC<SystemStatusProps> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "default";
      case "error":
        return "red";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  return <Tag color={getColor()}>{status.toUpperCase()}</Tag>;
};

export default SystemStatus;
