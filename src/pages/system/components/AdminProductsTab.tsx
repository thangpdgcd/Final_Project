import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm } from 'antd';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import type { Product, CreateProductDto } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const AdminProductsTab: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm<CreateProductDto>();

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const getCategoryName = (id: number) => categories.find(c => Number(c.category_ID) === Number(id))?.name || `#${id}`;

  const openCreate = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); form.setFieldsValue(p); setOpen(true); };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.product_ID, payload: values });
        message.success('Đã cập nhật sản phẩm');
      } else {
        await createProduct.mutateAsync(values as CreateProductDto);
        message.success('Đã tạo sản phẩm');
      }
      setOpen(false);
    } catch { /* form validation errors */ }
  };

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'product_ID', width: 60 },
    { title: 'Tên', dataIndex: 'name', ellipsis: true },
    { title: 'Danh mục', dataIndex: 'categories_ID', render: (id: number) => getCategoryName(id) },
    { title: 'Giá', dataIndex: 'price', render: (v: number) => v?.toLocaleString() + '₫' },
    { title: 'Kho', dataIndex: 'stock' },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => deleteProduct.mutate(record.product_ID)}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#4e3524]">Danh sách sản phẩm</h3>
        <Button type="primary" style={{ background: '#6f4e37' }} onClick={openCreate}>+ Thêm sản phẩm</Button>
      </div>
      <Table columns={columns} dataSource={products} rowKey="product_ID" loading={isLoading} />

      <Modal
        open={open}
        title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        okButtonProps={{ style: { background: '#6f4e37' }, loading: createProduct.isPending || updateProduct.isPending }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="stock" label="Kho" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="categories_ID" label="Danh mục ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProductsTab;
