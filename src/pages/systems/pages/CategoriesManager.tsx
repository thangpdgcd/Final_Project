// src/pages/systems/pages/CategoryManager.tsx
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
  getCategoryId,
  normalizeCategory,
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
        error?.response?.data || error?.message || error
      );
      message.destroy();
      message.error("Không thể tải danh sách danh mục. Kiểm tra backend!");
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
    [categories, searchText]
  );

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditCategory = (record: any) => {
    const id = getCategoryId(record);
    if (!id) {
      message.error(
        "Record không có ID hợp lệ (category_ID / id / categoryId...)."
      );
      console.log("Record keys:", Object.keys(record || {}), record);
      return;
    }

    setEditingCategory(record);
    form.setFieldsValue(toCategoryFormValues(record));
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (record: any) => {
    const id = getCategoryId(record);
    if (!id) {
      message.error("Không tìm thấy ID danh mục hợp lệ để xoá.");
      console.log("Delete record:", record);
      return;
    }

    try {
      await deleteCategoryService(id);
      setCategories((prev) => prev.filter((c) => getCategoryId(c) !== id));
      message.success("Đã xóa danh mục.");
    } catch (error: any) {
      console.error(
        "Delete category error:",
        error?.response?.data || error?.message || error
      );
      message.error(error?.response?.data?.message || "Xóa danh mục thất bại.");
    }
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      setSaving(true);

      const nextName = values.name.trim();
      const nextDesc = values.description?.trim() || "";

      if (editingCategory) {
        const id = getCategoryId(editingCategory);
        if (!id) {
          message.error("Không tìm thấy ID danh mục hợp lệ để cập nhật.");
          console.log("editingCategory:", editingCategory);
          return;
        }

        const updatedFromApi = await updateCategoryService(id, values);

        const normalizedApi = normalizeCategory(updatedFromApi ?? {});
        const normalizedEditing = normalizeCategory(editingCategory);

        const nextRecord = {
          ...normalizedEditing,
          ...normalizedApi,
          category_ID: id,
          name: nextName,
          description: nextDesc,
        };

        setCategories((prev) =>
          prev.map((c) =>
            getCategoryId(c) === id ? { ...c, ...nextRecord } : c
          )
        );

        message.success("Cập nhật danh mục thành công.");
      } else {
        const createdFromApi = await createCategoryService(values);

        // ✅ normalize để chắc chắn table đọc được name/description
        const createdNormalized = normalizeCategory(createdFromApi ?? {});
        const nextCreated = {
          ...createdNormalized,
          name: nextName,
          description: nextDesc,
        };

        setCategories((prev) => [nextCreated, ...prev]);
        message.success("Tạo danh mục mới thành công.");
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (error: any) {
      console.error(
        "Save category error:",
        error?.response?.data || error?.message || error
      );
      message.error(error?.response?.data?.message || "Lưu danh mục thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "ID",
      key: "id",
      width: 80,
      sorter: (a, b) => (getCategoryId(a) ?? 0) - (getCategoryId(b) ?? 0),
      render: (_: any, record: any) =>
        getCategoryId(record) ?? <span style={{ opacity: 0.6 }}>—</span>,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      width: 240,
      render: (_: any, record: any) => record?.name ?? record?.Name ?? "—",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      render: (_: any, record: any) =>
        record?.description ??
        record?.Description ?? <span style={{ opacity: 0.6 }}>—</span>,
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}>
            Sửa
          </Button>

          <Popconfirm
            title='Xóa danh mục'
            description='Bạn chắc chắn muốn xóa danh mục này?'
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
              placeholder='Tìm theo ID hoặc tên danh mục...'
              allowClear
              style={{ width: 280 }}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
            String(
              getCategoryId(record) ??
                record?.name ??
                record?.Name ??
                Math.random()
            )
          }
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        okText={editingCategory ? "Lưu" : "Tạo mới"}
        onOk={() => form.submit()}
        confirmLoading={saving}
        destroyOnClose>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            label='Tên danh mục'
            name='name'
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục!" },
            ]}>
            <Input placeholder='Tên danh mục' />
          </Form.Item>

          <Form.Item label='Mô tả' name='description'>
            <TextArea rows={3} placeholder='Mô tả danh mục (tuỳ chọn)' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager;
