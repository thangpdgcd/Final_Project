import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  fetchCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  filterCategories,
  toCategoryFormValues,
  normalizeCategory,
  getCategoryId,
  type CategoryFormValues,
} from "../../../pages/systems/services/categoryservicesSystem";

const { TextArea } = Input;

const CategoryManager: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const [form] = Form.useForm<CategoryFormValues>();
  const fetched = useRef(false);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchCategoriesService();
      setData(res);
    } catch {
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchData();
  }, []);

  const filteredData = useMemo(
    () => filterCategories(data, search),
    [data, search],
  );

  /* ================= ACTION ================= */
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue(toCategoryFormValues(record));
    setOpen(true);
  };

  const handleDelete = async (record: any) => {
    const id = getCategoryId(record);
    if (!id) return;

    await deleteCategoryService(id);
    setData((prev) => prev.filter((i) => getCategoryId(i) !== id));
    message.success("Category deleted");
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setSaving(true);

      if (editing) {
        const id = getCategoryId(editing);
        const updated = await updateCategoryService(id ?? 0, values);
        const normalized = normalizeCategory(updated ?? {});  

        setData((prev) =>
          prev.map((i) =>
            getCategoryId(i) === id ? { ...i, ...normalized } : i,
          ),
        );
        message.success("Updated successfully");
      } else {
        const created = await createCategoryService(values);
        setData((prev) => [normalizeCategory(created ?? {}), ...prev]);
        message.success("Category created successfully");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
    } catch {
      message.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= TABLE ================= */
  const columns: ColumnsType<any> = [
    {
      title: "ID",
      width: 80,
      align: "center",
      render: (_, r) => getCategoryId(r) ?? "—",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      width: 160,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete category?"
            okText="Delete"
            cancelText="Cancel"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="system-manager">
      <h2 className="system-manager__title">
        <AppstoreOutlined /> Category Management
      </h2>

      <Card
        className="system-manager__panel"
        title={
          <span className="system-manager__toolbar-label">
            <AppstoreOutlined /> Categories
          </span>
        }
        extra={
          <Space className="system-manager__toolbar-actions">
            <Input
              className="system-manager__search"
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by ID or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="system-manager__btn-add"
              onClick={openCreate}
            >
              Add category
            </Button>
          </Space>
        }
      >
        <div className="system-manager__table">
          <Table
            rowKey={(r) => String(getCategoryId(r))}
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Card>

      {/* MODAL */}
      <Modal
        title={editing ? "Edit category" : "Add category"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editing ? "Save" : "Create"}
      >
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Form.Item
            label="Category name"
            name="name"
            rules={[{ required: true, message: "Enter category name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager;
