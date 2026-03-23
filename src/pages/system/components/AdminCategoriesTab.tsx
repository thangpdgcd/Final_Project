import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import type { Category, CreateCategoryDto } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const AdminCategoriesTab: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm<CreateCategoryDto>();

  const { data: categories = [], isLoading } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); form.setFieldsValue(c); setOpen(true); };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateCat.mutateAsync({ id: editing.category_ID, payload: values });
        message.success('Đã cập nhật danh mục');
      } else {
        await createCat.mutateAsync(values);
        message.success('Đã tạo danh mục');
      }
      setOpen(false);
    } catch { /**/ }
  };

  const columns: ColumnsType<Category> = [
    { title: 'ID', dataIndex: 'category_ID', width: 70 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
    {
      title: 'Hành động', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>Sửa</Button>
          <Popconfirm title="Xóa danh mục?" onConfirm={() => deleteCat.mutate(r.category_ID)}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#4e3524]">Danh mục</h3>
        <Button type="primary" style={{ background: '#6f4e37' }} onClick={openCreate}>+ Thêm danh mục</Button>
      </div>
      <Table columns={columns} dataSource={categories} rowKey="category_ID" loading={isLoading} />
      <Modal open={open} title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} onOk={handleSave} onCancel={() => setOpen(false)}
        okButtonProps={{ style: { background: '#6f4e37' } }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategoriesTab;
