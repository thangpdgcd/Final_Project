import React from 'react';
import { Table, Tag, Spin, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/features/users/services/users.service';
import type { User } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const columns: ColumnsType<User> = [
  { title: 'ID', dataIndex: 'user_ID', width: 70 },
  { title: 'Tên', dataIndex: 'name' },
  { title: 'Email', dataIndex: 'email', ellipsis: true },
  { title: 'Điện thoại', dataIndex: 'phoneNumber' },
  { title: 'Vai trò', dataIndex: 'roleID', render: (r: number) => <Tag color={r === 1 ? 'gold' : 'blue'}>{r === 1 ? 'Admin' : 'Khách hàng'}</Tag> },
  { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s || '—'}</Tag> },
];

const AdminUsersTab: React.FC = () => {
  const { data: users = [], isLoading, error } = useQuery({ queryKey: ['users'], queryFn: usersService.getAll });
  if (isLoading) return <div className="page-loading"><Spin /></div>;
  if (error) return <Alert type="error" message="Không thể tải danh sách người dùng" />;
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#4e3524] mb-4">Người dùng ({users.length})</h3>
      <Table columns={columns} dataSource={users} rowKey="user_ID" />
    </div>
  );
};

export default AdminUsersTab;
