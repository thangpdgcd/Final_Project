import React from "react";
import { Input, Select, Button, Space } from "antd";

interface SystemFilterProps {
  onSearch: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

const SystemFilter: React.FC<SystemFilterProps> = ({
  onSearch,
  onStatusChange,
}) => {
  return (
    <Space style={{ marginBottom: 16 }}>
      <Input.Search
        placeholder='Search...'
        onSearch={onSearch}
        allowClear
        style={{ width: 220 }}
      />
      <Select
        placeholder='Status'
        onChange={onStatusChange}
        allowClear
        style={{ width: 160 }}>
        <Select.Option value='active'>Active</Select.Option>
        <Select.Option value='inactive'>Inactive</Select.Option>
        <Select.Option value='error'>Error</Select.Option>
        <Select.Option value='pending'>Pending</Select.Option>
      </Select>
      <Button type='primary'>Add New</Button>
    </Space>
  );
};

export default SystemFilter;
