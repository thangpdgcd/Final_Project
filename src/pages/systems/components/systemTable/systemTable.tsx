import React from "react";
import { Table } from "antd";
import "./index.scss";

interface SystemTableProps {
  columns: any[];
  data: any[];
  loading?: boolean;
}

const SystemTable: React.FC<SystemTableProps> = ({
  columns,
  data,
  loading,
}) => {
  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
      rowKey={(record) => record.id || record.key}
      bordered
    />
  );
};

export default SystemTable;
