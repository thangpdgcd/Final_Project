// src/pages/systems/pages/ProductManager.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Progress,
} from "antd";
import type { UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";

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

const CLOUDINARY_CLOUD_NAME = "dyfbye716";
const CLOUDINARY_UPLOAD_PRESET = "user_avatar";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

type CloudinaryUploadResult = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

function uploadDirectToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): {
  promise: Promise<{ secure_url: string; public_id?: string }>;
  abort: () => void;
} {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<{ secure_url: string; public_id?: string }>(
    (resolve, reject) => {
      xhr.open("POST", CLOUDINARY_UPLOAD_URL);

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const percent = Math.round((evt.loaded * 100) / evt.total);
        onProgress?.(percent);
      };

      xhr.onload = () => {
        try {
          const json: CloudinaryUploadResult = JSON.parse(
            xhr.responseText || "{}"
          );

          if (xhr.status >= 200 && xhr.status < 300) {
            if (!json.secure_url) {
              return reject(
                new Error("Upload succeeded but missing secure_url")
              );
            }
            return resolve({
              secure_url: json.secure_url,
              public_id: json.public_id,
            });
          }

          return reject(
            new Error(
              json?.error?.message || `Upload failed (HTTP ${xhr.status})`
            )
          );
        } catch {
          return reject(new Error("Invalid Cloudinary response"));
        }
      };

      xhr.onerror = () =>
        reject(new Error("Network error while uploading to Cloudinary"));
      xhr.onabort = () => reject(new Error("Upload aborted"));

      const formData = new FormData();
      formData.append("file", file); // ✅ Cloudinary expects "file"
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      xhr.send(formData);
    }
  );

  return { promise, abort: () => xhr.abort() };
}

/* ================= TYPES ================= */
interface SelectOption {
  value: number;
  label: string;
}
const isOption = (x: SelectOption | null): x is SelectOption => x !== null;

/* ================= HELPERS ================= */
function isValidImageValue(v?: string) {
  if (!v) return false;
  const s = v.trim();
  return (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("data:image/")
  );
}

function normalizeCategory(c: any): SelectOption | null {
  const id = Number(
    c?.category_ID || c?.categories_ID || c?.id || c?.categoryId
  );
  const name = String(
    c?.name || c?.category_name || c?.title || c?.categoryName || ""
  ).trim();
  if (!id || !name) return null;
  return { value: id, label: `${name} (#${id})` };
}

function normalizeUser(u: any): SelectOption | null {
  const id = Number(u?.user_ID || u?.id || u?.userId);
  const label = String(
    u?.name || u?.username || u?.email || u?.fullName || ""
  ).trim();
  if (!id) return null;
  return { value: id, label: `${label || `User #${id}`} (#${id})` };
}

const ProductManager: React.FC = () => {
  const [form] = Form.useForm();
  const imageValue = Form.useWatch("image", form);

  const abortUploadRef = useRef<null | (() => void)>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [searchText, setSearchText] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  // ---------- LOAD DATA ----------
  const loadData = async () => {
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
    } catch (err) {
      console.error(err);
      message.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // cleanup abort upload when unmount
  useEffect(() => {
    return () => abortUploadRef.current?.();
  }, []);

  // ---------- OPTIONS + FILTER ----------
  const categoryOptions = useMemo<SelectOption[]>(
    () => categories.map(normalizeCategory).filter(isOption),
    [categories]
  );

  const userOptions = useMemo<SelectOption[]>(
    () => users.map(normalizeUser).filter(isOption),
    [users]
  );

  const filteredProducts = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    if (!kw) return products;
    return products.filter(
      (p) =>
        String(p.product_ID).includes(kw) ||
        String(p.name || "")
          .toLowerCase()
          .includes(kw)
    );
  }, [products, searchText]);

  // ---------- MODAL (ONE FUNCTION FOR CREATE + EDIT) ----------
  const openModal = (p?: Product) => {
    setUploadPercent(0);
    abortUploadRef.current = null;

    if (!p) {
      setEditingProduct(null);
      form.setFieldsValue({
        name: "",
        price: 0,
        stock: 0,
        description: "",
        image: "",
        categories_ID: undefined,
        user_ID: undefined,
      });
    } else {
      setEditingProduct(p);
      form.setFieldsValue({
        name: p.name,
        price: Number((p as any).price ?? 0),
        stock: Number((p as any).stock ?? 0),
        description: (p as any).description || "",
        image: String((p as any).image || "").trim(),
        categories_ID: Number((p as any).categories_ID),
        user_ID: Number((p as any).user_ID),
      });
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    // abort upload if any
    abortUploadRef.current?.();
    abortUploadRef.current = null;

    setUploading(false);
    setUploadPercent(0);
    setModalOpen(false);
  };

  // ---------- CRUD ----------
  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success("Deleted successfully.");
      loadData();
    } catch (err) {
      console.error(err);
      message.error("Delete failed.");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      const img = String(values.image || "").trim();
      if (!isValidImageValue(img)) {
        message.error("Please upload an image (Cloudinary URL).");
        return;
      }

      const payload: any = {
        name: String(values.name || "").trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        description: values.description || "",
        image: img,
        categories_ID: Number(values.categories_ID),
        user_ID: Number(values.user_ID),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.product_ID, payload);
        message.success("Updated successfully.");
      } else {
        await createProduct(payload);
        message.success("Created successfully.");
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      message.error(
        err?.response?.data?.message || err?.message || "Save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------- UPLOAD (DIRECT CLOUDINARY) ----------
  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (uploading) return Upload.LIST_IGNORE;

    const f = file as RcFile;

    if (!f.type?.startsWith("image/")) {
      message.error("Only image files are allowed.");
      return Upload.LIST_IGNORE;
    }

    if (f.size / 1024 / 1024 >= 4) {
      message.error("Image must be smaller than 4MB.");
      return Upload.LIST_IGNORE;
    }

    try {
      setUploading(true);
      setUploadPercent(0);

      const { promise, abort } = uploadDirectToCloudinary(
        f as unknown as File,
        setUploadPercent
      );

      abortUploadRef.current = abort;

      const result = await promise;

      form.setFieldsValue({ image: result.secure_url });
      message.success("Image uploaded successfully.");
      setTimeout(() => setUploadPercent(0), 600);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      message.error(err?.message || "Image upload failed.");
      setUploadPercent(0);
    } finally {
      abortUploadRef.current = null;
      setUploading(false);
    }

    return false; // stop antd auto upload
  };

  const uploadProps: UploadProps = {
    accept: "image/*",
    maxCount: 1,
    showUploadList: false,
    beforeUpload,
  };

  // ---------- TABLE ----------
  const columns: ColumnsType<Product> = [
    { title: "ID", dataIndex: "product_ID", width: 70 },
    { title: "Name", dataIndex: "name", width: 220 },
    {
      title: "Price",
      dataIndex: "price",
      width: 150,
      render: (v: any) =>
        Number(v || 0).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      width: 110,
      render: (v: any) => (
        <Tag color={Number(v) > 0 ? "green" : "volcano"}>{v}</Tag>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      width: 130,
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
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => openModal(record)}>
            Edit
          </Button>

          <Popconfirm
            title='Delete product'
            description='Are you sure you want to delete this product?'
            okText='Delete'
            cancelText='Cancel'
            onConfirm={() => handleDelete(record.product_ID)}>
            <Button danger size='small' icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ---------- UI ----------
  return (
    <div style={{ padding: 24 }}>
      <Card
        title='Product Management'
        extra={
          <Space>
            <Input
              placeholder='Search by ID or name...'
              allowClear
              style={{ width: 320 }}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => openModal()}>
              Add product
            </Button>
          </Space>
        }>
        <Table
          rowKey='product_ID'
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 980 }}
        />
      </Card>

      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        title={editingProduct ? "Update Product" : "Create Product"}
        destroyOnClose>
        <Form layout='vertical' form={form} onFinish={handleSubmit}>
          <Form.Item
            name='name'
            label='Name'
            rules={[{ required: true, message: "Please enter product name." }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name='price'
            label='Price (VND)'
            rules={[{ required: true, message: "Please enter price." }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name='stock'
            label='Stock'
            rules={[
              { required: true, message: "Please enter stock quantity." },
            ]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name='description' label='Description'>
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label='Image' required>
            <Space
              align='start'
              style={{ width: "100%", justifyContent: "space-between" }}>
              <div style={{ minWidth: 260 }}>
                <Upload {...uploadProps}>
                  <Button
                    icon={<UploadOutlined />}
                    loading={uploading}
                    disabled={uploading}>
                    {isValidImageValue(imageValue)
                      ? "Change image"
                      : "Upload image"}
                  </Button>
                </Upload>

                {uploading && (
                  <div style={{ marginTop: 8 }}>
                    <Progress percent={uploadPercent} size='small' />
                  </div>
                )}
              </div>

              {isValidImageValue(imageValue) ? (
                <img
                  src={imageValue}
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
                  No image
                </div>
              )}
            </Space>
          </Form.Item>

          {/* hidden value used for validate + submit */}
          <Form.Item
            name='image'
            hidden
            rules={[{ required: true, message: "Please upload an image." }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name='categories_ID'
            label='Category'
            rules={[{ required: true, message: "Please select a category." }]}>
            <Select
              options={categoryOptions}
              showSearch
              optionFilterProp='label'
              placeholder='Select category'
            />
          </Form.Item>

          <Form.Item
            name='user_ID'
            label='Owner'
            rules={[{ required: true, message: "Please select an owner." }]}>
            <Select
              options={userOptions}
              showSearch
              optionFilterProp='label'
              placeholder='Select owner'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManager;
