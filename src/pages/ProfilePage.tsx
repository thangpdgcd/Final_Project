import React from 'react';
import { useParams } from 'react-router-dom';
import { Descriptions, Avatar, Skeleton, Alert, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/features/users/services/users.service';
import { useAuth } from '@/store/AuthContext';

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { userid } = useParams<{ userid: string }>();
  const userId = userid ? Number(userid) : authUser?.user_ID;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getById(Number(userId)),
    enabled: typeof userId === 'number' && Number.isFinite(userId),
  });

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-12"><Skeleton avatar active /></div>;
  if (error || !user) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Alert type="error" message="Không tìm thấy hồ sơ người dùng" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {/* Cover */}
        <div className="h-32" style={{ background: 'linear-gradient(135deg, #4e3524, #c4963b)' }} />

        {/* Avatar + name */}
        <div className="px-8 pb-8">
          <div className="flex items-end gap-4 -mt-12 mb-6">
            <Avatar
              size={96}
              icon={<UserOutlined />}
              style={{ background: '#6f4e37', border: '4px solid white', fontSize: 36 }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-[#4e3524] dark:text-amber-100" style={{ fontFamily: 'var(--font-display)' }}>
                {user.name}
              </h1>
              <Tag color={user.status === 'active' ? 'green' : 'default'}>
                {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
              </Tag>
            </div>
          </div>

          <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600 }}>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Điện thoại">{user.phoneNumber || '—'}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{user.address || '—'}</Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={user.roleID === 1 ? 'gold' : 'blue'}>
                {user.roleID === 1 ? 'Admin' : 'Khách hàng'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tham gia">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
