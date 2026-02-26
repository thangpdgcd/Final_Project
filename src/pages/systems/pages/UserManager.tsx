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
  Select,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  fetchUsersService,
  createUserService,
  updateUserService,
  deleteUserService,
  getIdString,
  getRoleId,
  ROLE,
} from "../services/userservicesSystem";

const { Text } = Typography;

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  /* ================= LOAD DATA ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await fetchUsersService();
      setUsers(list || []);
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= SEARCH & FILTER ================= */
  const filteredUsers = useMemo(() => {
    let list = users;
    if (statusFilter === "active") list = list.filter((u) => u.status === "active");
    else if (statusFilter === "inactive") list = list.filter((u) => u.status !== "active");
    if (!searchText) return list;
    const kw = searchText.toLowerCase();
    return list.filter((u) =>
      Object.values(u).some((v) =>
        String(v ?? "").toLowerCase().includes(kw)
      )
    );
  }, [users, searchText, statusFilter]);

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreateLoading(true);
      await createUserService({
        name: values.name,
        email: values.email,
        password: values.password,
        roleID: values.roleID,
      });
      message.success("User created successfully");
      setModalOpen(false);
      form.resetFields();
      loadUsers();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || "Create user failed");
    } finally {
      setCreateLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEditOpen = (row: any) => {
    setEditingUser(row);
    editForm.setFieldsValue({
      name: row.name || row.username,
      email: row.email,
      roleID: getRoleId(row),
      status: row.status === "active" ? "active" : "inactive",
    });
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      await updateUserService(getIdString(editingUser), {
        name: values.name,
        email: values.email,
        roleID: values.roleID,
        status: values.status,
      });
      message.success("User updated");
      setEditModalOpen(false);
      setEditingUser(null);
      editForm.resetFields();
      loadUsers();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    try {
      await deleteUserService(id);
      message.success("User deleted");
      loadUsers();
    } catch {
      message.error("Delete failed");
    }
  };

  /* ================= TABLE ================= */
  const columns: ColumnsType<any> = [
    {
      title: "User",
      render: (_, r) => (
        <Space align="start">
          <UserOutlined className="system-manager__user-icon" />
          <div>
            <Text strong>{r.name || r.username}</Text>
            <br />
            <Text type="secondary">
              <MailOutlined /> {r.email}
            </Text>
            <br />
            <Text type="secondary">
              <PhoneOutlined /> {r.phoneNumber || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      align: "center",
      render: (_, r) => (
        <Tag
          color={r.status === "active" ? "green" : "magenta"}
          className="system-manager__tag system-manager__tag--status"
        >
          {r.status === "active" ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Role",
      align: "center",
      render: (_, r) => (
        <Tag className="system-manager__tag system-manager__tag--role">
          {getRoleId(r) === 2 ? "ADMIN" : "USER"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      align: "center",
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditOpen(r)} />
          <Popconfirm
            title="Delete user?"
            onConfirm={() => handleDelete(getIdString(r))}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = [
    { title: "Total Users", value: users.length, primary: true },
    { title: "Active", value: users.filter((u) => u.status === "active").length, primary: false },
    { title: "Admins", value: users.filter((u) => getRoleId(u) === 2).length, primary: false },
    { title: "Inactive", value: users.filter((u) => u.status !== "active").length, primary: false },
  ];

  /* ================= UI ================= */
  return (
    <div className="system-manager">
      <h2 className="system-manager__title">
        <SettingOutlined /> System - User Management
      </h2>

      <Row gutter={16} className="system-manager__stats">
        {stats.map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card
              className={s.primary ? "system-manager__stat-card system-manager__stat-card--primary" : "system-manager__stat-card system-manager__stat-card--light"}
            >
              <Statistic
                title={s.title}
                value={s.value}
                valueStyle={{ color: "#fff", fontSize: 28 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        className="system-manager__panel"
        title={
          <span className="system-manager__toolbar-label">
            <UserOutlined /> Users
          </span>
        }
        extra={
          <Space className="system-manager__toolbar-actions">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              style={{ width: 110 }}
            />
            <Input
              className="system-manager__search"
              prefix={<SearchOutlined />}
              placeholder="Search users..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="system-manager__btn-add"
              onClick={() => setModalOpen(true)}
            >
              Add user
            </Button>
          </Space>
        }
      >
        <div className="system-manager__table">
          <Table
            rowKey={(r) => getIdString(r)}
            loading={loading}
            columns={columns}
            dataSource={filteredUsers}
            pagination={{ pageSize: 6 }}
          />
        </div>
      </Card>

      <Modal
        title="Add user"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="roleID"
            label="Role"
            initialValue={ROLE.USER}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: ROLE.USER, label: "User" },
                { value: ROLE.ADMIN, label: "Admin" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit user"
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        confirmLoading={editLoading}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="roleID"
            label="Role"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: ROLE.USER, label: "User" },
                { value: ROLE.ADMIN, label: "Admin" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager;
