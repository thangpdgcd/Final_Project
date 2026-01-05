// src/pages/systems/AdminManager.tsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  fetchUsers,
  createUser,
  editUser,
  removeUser,
  roleToLabel,
  normalizeUser,
  type AdminFormValues,
} from "../services/managerservicesSystem";

const { Option } = Select;

const AdminManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form] = Form.useForm<AdminFormValues>();

  /* ---------------- LOAD USERS ---------------- */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await fetchUsers();
      setUsers(list);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách người dùng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ---------------- ADD USER ---------------- */
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      roleID: "3", // mặc định Admin
      status: "active",
    });
    setIsModalOpen(true);
  };

  /* ---------------- EDIT USER ---------------- */
  const handleEditUser = (record: any) => {
    const r = normalizeUser(record);
    setEditingUser(r);

    form.resetFields();
    form.setFieldsValue({
      name: r.username ?? r.name ?? "",
      email: r.email,
      address: r.address,
      phoneNumber: r.phoneNumber,
      roleID: String(r.roleID ?? "1"),
      status: r.status ?? "active",
    });

    setIsModalOpen(true);
  };

  /* ---------------- DELETE USER ---------------- */
  const handleDeleteUser = async (record: any) => {
    try {
      await removeUser(record.user_ID); // ✅ đúng cột user_ID trong DB
      message.success("Đã xóa người dùng thành công.");
      loadUsers();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || err?.message || "Xóa thất bại."
      );
    }
  };

  /* ---------------- SUBMIT (CREATE / EDIT) ---------------- */
  const handleSubmit = async (values: AdminFormValues) => {
    try {
      if (editingUser) {
        await editUser(editingUser.user_ID, values); // ✅ dùng user_ID
        message.success("Cập nhật thành công.");
      } else {
        await createUser(values);
        message.success("Tạo mới thành công.");
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || err?.message || "Lưu thất bại."
      );
    }
  };

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns: ColumnsType<any> = [
    { title: "ID", dataIndex: "user_ID", width: 100 },
    {
      title: "Tên",
      dataIndex: "username",
      width: 180,
      render: (_: any, r: any) => r.username ?? r.name,
    },
    { title: "Email", dataIndex: "email", width: 220 },
    { title: "Số điện thoại", dataIndex: "phoneNumber", width: 150 },
    {
      title: "Role",
      dataIndex: "roleID",
      width: 120,
      render: (roleID: any) => {
        const { color, text } = roleToLabel(roleID);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (status: "active" | "inactive") => (
        <Tag color={status === "active" ? "green" : "volcano"}>
          {status === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size='small'
            onClick={() => handleEditUser(record)}>
            Sửa
          </Button>
          <Popconfirm
            title='Xóa người dùng'
            description='Bạn chắc chắn muốn xóa người dùng này?'
            okText='Xóa'
            cancelText='Hủy'
            onConfirm={() => handleDeleteUser(record)}>
            <Button danger icon={<DeleteOutlined />} size='small'>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <div style={{ padding: 24 }}>
      <Card
        title='System Admin - Quản lý tài khoản'
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={handleAddUser}>
            Thêm tài khoản
          </Button>
        }>
        <Table
          rowKey={(r) => String(r.user_ID)} // ✅ dùng đúng khóa chính
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* -------- Modal Form -------- */}
      <Modal
        title={editingUser ? "Cập nhật tài khoản" : "Thêm tài khoản"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText={editingUser ? "Lưu" : "Tạo mới"}
        onOk={() => form.submit()}
        destroyOnClose>
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{ status: "active", roleID: "3" }}>
          <Form.Item
            label='Tên'
            name='name'
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
            <Input placeholder='Tên người dùng' />
          </Form.Item>

          <Form.Item
            label='Email'
            name='email'
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}>
            <Input placeholder='you@example.com' />
          </Form.Item>

          <Form.Item label='Địa chỉ' name='address'>
            <Input placeholder='Địa chỉ' />
          </Form.Item>

          <Form.Item label='Số điện thoại' name='phoneNumber'>
            <Input placeholder='Số điện thoại' />
          </Form.Item>

          <Form.Item
            label='Role'
            name='roleID'
            rules={[{ required: true, message: "Vui lòng chọn role!" }]}>
            <Select>
              <Option value='1'>User</Option>
              <Option value='2'>Manager</Option>
              <Option value='3'>Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item label='Trạng thái' name='status'>
            <Select>
              <Option value='active'>Active</Option>
              <Option value='inactive'>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManager;
