import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
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
  getCategoryId, // ✅ FIX: THIẾU IMPORT NÀY
  type CategoryFormValues,
} from "../../../pages/systems/services/categoryservicesSystem";

const { TextArea } = Input;

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [form] = Form.useForm<CategoryFormValues>();

  const [searchText, setSearchText] = useState("");
  const didFetchRef = useRef(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategoriesService();
      setCategories(data);
    } catch (error: any) {
      console.error(
        "Fetch categories error:",
        error?.response?.data || error?.message || error,
      );
      message.error("Không thể tải danh sách danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(
    () => filterCategories(categories, searchText),
    [categories, searchText],
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditCategory = (record: any) => {
    const id = getCategoryId(record);
    if (!id) {
      message.error("Danh mục không có ID hợp lệ.");
      console.log("Record:", record);
      return;
    }

    setEditingCategory(record);
    form.setFieldsValue(toCategoryFormValues(record));
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (record: any) => {
    const id = getCategoryId(record);
    if (!id) {
      message.error("Không tìm thấy ID danh mục để xoá.");
      return;
    }

    try {
      await deleteCategoryService(id);
      setCategories((prev) => prev.filter((c) => getCategoryId(c) !== id));
      message.success("Đã xoá danh mục.");
    } catch (error: any) {
      console.error(error);
      message.error(error?.response?.data?.message || "Xoá danh mục thất bại.");
    }
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      setSaving(true);

      if (editingCategory) {
        const id = getCategoryId(editingCategory);
        if (!id) {
          message.error("ID danh mục không hợp lệ.");
          return;
        }

        const updated = await updateCategoryService(id, values);
        const normalized = normalizeCategory(updated ?? {});

        setCategories((prev) =>
          prev.map((c) =>
            getCategoryId(c) === id ? { ...c, ...normalized } : c,
          ),
        );

        message.success("Cập nhật danh mục thành công.");
      } else {
        const created = await createCategoryService(values);
        const normalized = normalizeCategory(created ?? {});

        setCategories((prev) => [normalized, ...prev]);
        message.success("Tạo danh mục mới thành công.");
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (error: any) {
      console.error(error);
      message.error(error?.response?.data?.message || "Lưu danh mục thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "ID",
      width: 80,
      sorter: (a, b) => (getCategoryId(a) ?? 0) - (getCategoryId(b) ?? 0),
      render: (_, record) =>
        getCategoryId(record) ?? <span style={{ opacity: 0.5 }}>—</span>,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      width: 240,
      render: (_, record) => record?.name ?? "—",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      render: (_, record) =>
        record?.description ?? <span style={{ opacity: 0.5 }}>—</span>,
    },
    {
      title: "Hành động",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}>
            Sửa
          </Button>

          <Popconfirm
            title='Xóa danh mục'
            description='Bạn chắc chắn muốn xóa?'
            okText='Xóa'
            cancelText='Hủy'
            onConfirm={() => handleDeleteCategory(record)}>
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
        title='Category Management'
        extra={
          <Space>
            <Input
              placeholder='Tìm theo ID hoặc tên...'
              allowClear
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 260 }}
            />
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddCategory}>
              Thêm danh mục
            </Button>
          </Space>
        }>
        <Table
          rowKey={(record) =>
            String(getCategoryId(record) ?? record?.name ?? Math.random())
          }
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editingCategory ? "Lưu" : "Tạo"}
        destroyOnClose>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            label='Tên danh mục'
            name='name'
            rules={[{ required: true, message: "Nhập tên danh mục!" }]}>
            <Input />
          </Form.Item>

          <Form.Item label='Mô tả' name='description'>
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager;
