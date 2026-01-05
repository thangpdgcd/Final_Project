import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Typography,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  fetchUsersService,
  createUserService,
  updateUserService,
  deleteUserService,
  type RoleID,
  getIdString,
  getRoleId,
} from "../services/userservicesSystem";

const { Text } = Typography;

type StatusType = "active" | "inactive";

type AdminFormValues = {
  username: string;
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  address: string;
  roleID: RoleID;
  status: StatusType;
};

const ROLE_OPTIONS = [
  { value: 1 as RoleID, label: "User" },
  { value: 2 as RoleID, label: "Admin" },
];

/** ✅ FIX: username phải lấy từ username (không lấy name) */
const getUsernameFromRecord = (record: any): string => {
  const raw = record?.name ?? "";
  return String(raw ?? "").trim();
};

const getPhoneFromRecord = (record: any): string =>
  String(record?.phoneNumber ?? record?.phone ?? "").trim();

const getEmailFromRecord = (record: any): string =>
  String(record?.email ?? "").trim();

const getNameFromRecord = (record: any): string =>
  String(
    record?.name ??
      record?.fullName ??
      record?.displayName ??
      record?.user?.name ??
      ""
  ).trim();

const getAddressFromRecord = (record: any): string =>
  String(record?.address ?? record?.user?.address ?? "").trim();

const normalizeStatus = (v: any): StatusType =>
  v === "active" ? "active" : "inactive";

const normalizeUserRow = (u: any) => {
  const idString = getIdString(u);
  const role = getRoleId(u);

  const username = getUsernameFromRecord(u);
  const name = getNameFromRecord(u) || username;

  return {
    ...u,
    _idString: idString,
    username,
    name,
    email: getEmailFromRecord(u),
    address: getAddressFromRecord(u),
    phoneNumber: getPhoneFromRecord(u),
    status: normalizeStatus(u?.status ?? u?.user?.status),
    roleID: role,
  };
};

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  /** ✅ id thật để update/delete (string) */
  const [editingId, setEditingId] = useState<string>("");

  const [form] = Form.useForm<AdminFormValues>();
  const [searchText, setSearchText] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await fetchUsersService();
      const normalized = (Array.isArray(list) ? list : []).map(
        normalizeUserRow
      );
      setUsers(normalized);
    } catch (err: any) {
      console.error("Fetch users error:", err?.response?.data || err);
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

  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) return users;
    const kw = searchText.trim().toLowerCase();

    return users.filter((u: any) => {
      const idString = String(u._idString ?? "").toLowerCase();
      const nameValue = String(u.name ?? "").toLowerCase();
      const usernameValue = String(u.username ?? "").toLowerCase();
      const phoneValue = String(u.phoneNumber ?? "").toLowerCase();
      const statusValue = String(u.status ?? "").toLowerCase();
      const roleText = u.roleID === 2 ? "admin" : "user";
      const roleNum = String(u.roleID ?? "").toLowerCase();

      return (
        idString.includes(kw) ||
        nameValue.includes(kw) ||
        usernameValue.includes(kw) ||
        phoneValue.includes(kw) ||
        statusValue.includes(kw) ||
        roleText.includes(kw) ||
        roleNum.includes(kw)
      );
    });
  }, [users, searchText]);

  const handleAddUser = () => {
    setEditingUser(null);
    setEditingId("");
    setIsModalOpen(true);
  };

  const handleEditUser = (record: any) => {
    const r = normalizeUserRow(record);

    const idStr = String(r._idString ?? "").trim();
    if (!idStr) {
      message.error(
        "Không tìm thấy ID người dùng để cập nhật (backend không trả id)."
      );
      return;
    }

    setEditingUser(r);
    setEditingId(idStr);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!isModalOpen) return;

    if (editingUser) {
      const r = normalizeUserRow(editingUser);
      form.resetFields();
      form.setFieldsValue({
        username: r.username ?? "",
        name: r.name ?? "",
        email: r.email ?? "",
        address: r.address ?? "",
        phoneNumber: r.phoneNumber ?? "",
        status: normalizeStatus(r.status),
        roleID: r.roleID,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        roleID: 1 as RoleID,
        status: "active",
        address: "",
        phoneNumber: "",
        username: "",
        name: "",
        email: "",
        password: "",
      });
    }
  }, [isModalOpen, editingUser, form]);

  const handleDeleteUser = async (record: any) => {
    try {
      const r = normalizeUserRow(record);
      const idStr = String(r._idString ?? "").trim();
      if (!idStr) {
        message.error("Không tìm thấy ID người dùng để xóa.");
        return;
      }

      await deleteUserService(idStr);
      message.success("Đã xóa người dùng.");
      await loadUsers();
    } catch (err: any) {
      console.error("Delete user error:", err?.response?.data || err);
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Xóa người dùng thất bại."
      );
    }
  };

  const handleSubmit = async (values: AdminFormValues) => {
    try {
      setSaving(true);

      const roleID: RoleID =
        Number(values.roleID) === 2 ? (2 as RoleID) : (1 as RoleID);

      if (editingUser) {
        if (!editingId) {
          message.error("Không tìm thấy ID người dùng để cập nhật.");
          return;
        }

        const updatePayload = {
          name: values.name?.trim(),
          username: values.username?.trim(),
          email: values.email?.trim(),
          phoneNumber: values.phoneNumber?.trim(),
          address: values.address?.trim(),
          status: values.status,
          roleID: roleID,
        };

        await updateUserService(editingId, updatePayload);
        message.success("Cập nhật người dùng thành công.");
      } else {
        // ✅ CREATE đầy đủ
        const createPayload: any = {
          username: values.username?.trim(),
          email: values.email?.trim(),
          password: values.password || "",
          roleID: roleID,
          // các field khác nếu backend register cần
          name: values.name?.trim(),
          phoneNumber: values.phoneNumber?.trim(),
          address: values.address?.trim(),
          status: values.status,
        };

        await createUserService(createPayload);
        message.success("Tạo người dùng thành công.");
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setEditingId("");
      form.resetFields();
      await loadUsers();
    } catch (err: any) {
      console.error("Save user error:", err?.response?.data || err);
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Lưu người dùng thất bại."
      );
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Tên",
      dataIndex: "name",
      width: 260,
      align: "center",
      render: (_: any, record: any) => {
        const displayName = record.name ?? record.username ?? "-";
        return <Text strong>{displayName}</Text>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 200,
      align: "center",
      render: (_: any, record: any) => {
        const s: StatusType = normalizeStatus(record.status);
        return (
          <Tag
            color={s === "active" ? "green" : "volcano"}
            style={{
              minWidth: 120,
              textAlign: "center",
              borderRadius: 10,
              padding: "5px 14px",
              fontWeight: 600,
            }}>
            {s === "active" ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      width: 220,
      align: "center",
      render: (_: any, record: any) => record.phoneNumber || "-",
    },
    {
      title: "Role",
      dataIndex: "roleID",
      width: 180,
      align: "center",
      render: (_: any, record: any) => {
        const role: RoleID = getRoleId(record);
        return (
          <Tag
            color={role === 2 ? "red" : "blue"}
            style={{
              minWidth: 90,
              textAlign: "center",
              borderRadius: 999,
              padding: "6px 18px",
              fontWeight: 700,
              textTransform: "capitalize",
            }}>
            {role === 2 ? "Admin" : "User"}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 200,
      align: "center",
      render: (_: any, record: any) => (
        <Space>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}>
            Sửa
          </Button>

          <Popconfirm
            title='Xóa người dùng'
            description='Bạn chắc chắn muốn xóa người dùng này?'
            okText='Xóa'
            cancelText='Hủy'
            onConfirm={() => handleDeleteUser(record)}>
            <Button danger size='small' icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title='User Management'
        extra={
          <Space>
            <Input
              placeholder='Tìm theo ID / Tên / Username / SĐT / Trạng thái / Role...'
              allowClear
              style={{ width: 460 }}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddUser}>
              Thêm người dùng
            </Button>
          </Space>
        }>
        <Table
          rowKey={(record: any) =>
            String(
              record._idString ||
                getIdString(record) ||
                record.email ||
                record.username
            )
          }
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={editingUser ? "Cập nhật người dùng" : "Thêm người dùng mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          setEditingId("");
          form.resetFields();
        }}
        okText={editingUser ? "Lưu" : "Tạo mới"}
        onOk={() => form.submit()}
        confirmLoading={saving}
        destroyOnClose>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            label='Tên (name)'
            name='name'
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
            <Input placeholder='Nguyễn Văn A' />
          </Form.Item>

          <Form.Item
            label='Username'
            name='username'
            rules={[{ required: true, message: "Vui lòng nhập username!" }]}>
            <Input placeholder='Nhập username' />
          </Form.Item>

          <Form.Item
            label='Số điện thoại'
            name='phoneNumber'
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^(0|\+84)\d{9,10}$/,
                message: "SĐT không hợp lệ (vd: 0123456789 hoặc +84123456789)",
              },
            ]}>
            <Input placeholder='0123456789' />
          </Form.Item>

          <Form.Item
            label='Trạng thái'
            name='status'
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
            <Select placeholder='Chọn trạng thái'>
              <Select.Option value='active'>Active</Select.Option>
              <Select.Option value='inactive'>Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label='Role'
            name='roleID'
            rules={[{ required: true, message: "Vui lòng chọn role!" }]}>
            <Select placeholder='Chọn role' options={ROLE_OPTIONS} />
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

          <Form.Item
            label='Địa chỉ'
            name='address'
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
            <Input placeholder='Nhập địa chỉ' />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label='Mật khẩu'
              name='password'
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
              ]}>
              <Input.Password placeholder='••••••••' />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager;
