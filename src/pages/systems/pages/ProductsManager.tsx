// src/pages/systems/pages/ProductManager.tsx
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
  InputNumber,
  Popconfirm,
  message,
  Select,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "../../../api/productApi";

import { getAllCategories } from "../../../api/categoriesApi";
import { fetchUsersService } from "../services/userservicesSystem";
import { getImageSrc } from "../services/productserviceSystem";

const { TextArea } = Input;

/* ================= TYPES ================= */
type SelectOption = { value: number; label: string };
function isOption(x: SelectOption | null): x is SelectOption {
  return x !== null;
}

/* ================= HELPERS ================= */
const normalizeCategory = (c: any): SelectOption | null => {
  const id = Number(
    c?.category_ID ?? c?.categories_ID ?? c?.id ?? c?.categoryId
  );
  const name = String(
    c?.name ?? c?.category_name ?? c?.title ?? c?.categoryName ?? ""
  ).trim();
  if (!id || !name) return null;
  return { value: id, label: `${name} (#${id})` };
};

const normalizeUser = (u: any): SelectOption | null => {
  const id = Number(u?.user_ID ?? u?.id ?? u?.userId);
  if (!id) return null;
  const label = String(
    u?.name ?? u?.username ?? u?.email ?? u?.fullName ?? ""
  ).trim();
  return { value: id, label: `${label || `User #${id}`} (#${id})` };
};

// ✅ File -> base64 dataURL
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isValidDataImage(v?: string) {
  return !!v && String(v).startsWith("data:image/");
}

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  /* ============== LOAD DATA ============== */
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [p, c, u] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        fetchUsersService(),
      ]);

      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch (e) {
      console.error(e);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ============== OPTIONS ============== */
  const categoryOptions = useMemo<SelectOption[]>(
    () => categories.map(normalizeCategory).filter(isOption),
    [categories]
  );

  const userOptions = useMemo<SelectOption[]>(
    () => users.map(normalizeUser).filter(isOption),
    [users]
  );

  /* ============== FILTER ============== */
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return products;
    const kw = searchText.trim().toLowerCase();
    return products.filter(
      (p) =>
        String(p.product_ID).includes(kw) ||
        (p.name || "").toLowerCase().includes(kw)
    );
  }, [products, searchText]);

  /* ============== ACTIONS ============== */
  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      price: 0,
      stock: 0,
      description: "",
      image: "", // dataURL nằm đây
      categories_ID: undefined,
      user_ID: undefined,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    form.resetFields();

    const rawImg = (p as any).image || "";
    // ✅ nếu backend trả base64 thuần => convert thành dataURL để preview + submit vẫn ok
    const imgForForm =
      rawImg && !String(rawImg).startsWith("data:image/")
        ? `data:image/jpeg;base64,${rawImg}`
        : rawImg;

    form.setFieldsValue({
      name: p.name,
      price: (p as any).price,
      stock: (p as any).stock,
      description: (p as any).description || "",
      image: imgForForm,
      categories_ID: Number((p as any).categories_ID),
      user_ID: Number((p as any).user_ID),
    });

    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success("Đã xóa");
      fetchAll();
    } catch (e) {
      console.error(e);
      message.error("Xóa thất bại");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      const img = String(values.image || "").trim();
      if (!isValidDataImage(img)) {
        message.error("Vui lòng upload ảnh từ máy.");
        return;
      }

      const payload = {
        name: String(values.name || "").trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        description: values.description || "",
        image: img, // ✅ gửi dataURL để backend split(",")[1]
        categories_ID: Number(values.categories_ID),
        user_ID: Number(values.user_ID),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.product_ID, payload);
        message.success("Cập nhật thành công");
      } else {
        // ✅ route create đã sửa đúng trong productApi.ts => /api/create-products
        await createProduct(payload);
        message.success("Tạo mới thành công");
      }

      setIsModalOpen(false);
      fetchAll();
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const imageUrl = Form.useWatch("image", form);

  /* ============== UPLOAD CONFIG ============== */
  const uploadProps: UploadProps = {
    accept: "image/*",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: async (file) => {
      const isImg = file.type?.startsWith("image/");
      if (!isImg) {
        message.error("Chỉ được chọn file ảnh.");
        return Upload.LIST_IGNORE;
      }

      // ✅ giảm risk 413 (base64 sẽ phình ra ~33%)
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Ảnh nên nhỏ hơn 2MB (tránh lỗi 413 khi gửi base64).");
        return Upload.LIST_IGNORE;
      }

      try {
        setUploading(true);
        const base64 = await fileToBase64(file as File);
        form.setFieldsValue({ image: base64 });
        message.success("Đã chọn ảnh");
      } catch (err) {
        console.error(err);
        message.error("Không thể đọc file ảnh");
      } finally {
        setUploading(false);
      }

      // ✅ không upload lên server
      return false;
    },
  };

  /* ============== TABLE ============== */
  const columns: ColumnsType<Product> = [
    { title: "ID", dataIndex: "product_ID", width: 70 },
    { title: "Tên", dataIndex: "name", width: 220 },
    {
      title: "Giá",
      dataIndex: "price",
      width: 140,
      render: (v: any) =>
        Number(v || 0).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Kho",
      dataIndex: "stock",
      width: 100,
      render: (v: any) => (
        <Tag color={Number(v) > 0 ? "green" : "volcano"}>{v}</Tag>
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      width: 120,
      render: (img?: string) => {
        const src = getImageSrc(img);
        return (
          <img
            src={src}
            alt='product'
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/no-image.png";
            }}
          />
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title='Xóa sản phẩm'
            description='Bạn chắc chắn muốn xóa sản phẩm này?'
            okText='Xóa'
            cancelText='Hủy'
            onConfirm={() => handleDelete(record.product_ID)}>
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
        title='Product Management'
        extra={
          <Space>
            <Input
              placeholder='Tìm theo ID hoặc tên...'
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm
            </Button>
          </Space>
        }>
        <Table
          rowKey='product_ID'
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        title={editingProduct ? "Cập nhật" : "Thêm mới"}
        destroyOnClose>
        <Form layout='vertical' form={form} onFinish={handleSubmit}>
          <Form.Item
            name='name'
            label='Tên'
            rules={[{ required: true, message: "Nhập tên" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name='price'
            label='Giá'
            rules={[{ required: true, message: "Nhập giá" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name='stock'
            label='Tồn kho'
            rules={[{ required: true, message: "Nhập tồn kho" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name='description' label='Mô tả'>
            <TextArea rows={3} />
          </Form.Item>

          {/* ✅ UPLOAD ẢNH */}
          <Form.Item label='Hình ảnh' required>
            <Space
              align='start'
              style={{ width: "100%", justifyContent: "space-between" }}>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {isValidDataImage(imageUrl) ? "Đổi ảnh" : "Upload ảnh"}
                </Button>
              </Upload>

              {isValidDataImage(imageUrl) ? (
                <img
                  src={imageUrl}
                  alt='preview'
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid #eee",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/no-image.png";
                  }}
                />
              ) : (
                <div style={{ color: "#999", fontSize: 12, paddingTop: 6 }}>
                  Chưa có ảnh
                </div>
              )}
            </Space>
          </Form.Item>

          {/* hidden field để submit */}
          <Form.Item
            name='image'
            hidden
            rules={[{ required: true, message: "Vui lòng upload ảnh!" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name='categories_ID'
            label='Danh mục'
            rules={[{ required: true, message: "Chọn danh mục" }]}>
            <Select
              options={categoryOptions}
              showSearch
              optionFilterProp='label'
              placeholder='Chọn danh mục'
            />
          </Form.Item>

          <Form.Item
            name='user_ID'
            label='Owner'
            rules={[{ required: true, message: "Chọn owner" }]}>
            <Select
              options={userOptions}
              showSearch
              optionFilterProp='label'
              placeholder='Chọn người dùng'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManager;
