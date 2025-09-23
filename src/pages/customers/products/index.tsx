import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts, Product } from "../../../api/productApi";
import {
  Card,
  Col,
  Row,
  Layout,
  Menu,
  Modal,
  Form,
  Input,
  Select,
  Button,
} from "antd";
import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import "./index.scss";

const { Header } = Layout;
const { Meta } = Card;
const { Option } = Select;

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    getAllProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error:", err.message));
  }, []);

  // Menu điều hướng
  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contact",
    login: "/login",
  };

  const handleMenuClick = (e: { key: string }) => {
    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  // Xử lý mở modal khi chọn sản phẩm
  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      console.log("Đặt hàng:", { ...values, product: selectedProduct });
      Modal.success({
        title: "Thành công",
        content: `Bạn đã đặt hàng ${selectedProduct?.name} thành công!`,
      });
      setOpenModal(false);
      form.resetFields();
    });
  };

  return (
    <div className='product-container'>
      {/* Header */}
      <Header className='homepage__header'>
        <div className='homepage__logo'>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        <Menu
          mode='horizontal'
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className='menu-home'
          items={[
            { key: "home", label: "Home" },
            { key: "products", label: "Coffee" },
            { key: "contact", label: "Contact" },
            { key: "about", label: "About" },
            { key: "login", label: "Log In" },
          ]}
        />
      </Header>

      {/* Danh sách sản phẩm */}
      <div className='product-list'>
        <Row gutter={[16, 16]}>
          {products.map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p.product_ID}>
              <Card
                hoverable
                cover={
                  p.image ? (
                    <img
                      src={`data:image/png;base64,${p.image}`}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: "6px 6px 0 0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f5f5f5",
                        color: "#999",
                        borderRadius: "6px 6px 0 0",
                      }}>
                      Không có ảnh
                    </div>
                  )
                }
                onClick={() => handleOrder(p)}>
                <Meta
                  title={p.name}
                  description={
                    <div className='product-meta'>
                      <p>Giá: {p.price.toLocaleString("vi-VN")} đ</p>
                      <p>Số lượng: {p.stock}</p>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Modal đặt hàng */}
      <Modal
        open={openModal}
        title={`Đặt hàng: ${selectedProduct?.name}`}
        onCancel={() => setOpenModal(false)}
        footer={null}>
        <Form layout='vertical' form={form} onFinish={handleSubmit}>
          <Form.Item
            name='customerName'
            label='Họ và tên'
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input placeholder='Nhập họ và tên' />
          </Form.Item>

          <Form.Item
            name='phone'
            label='Số điện thoại'
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
            ]}>
            <Input placeholder='Nhập số điện thoại' />
          </Form.Item>

          <Form.Item name='size' label='Chọn size'>
            <Select placeholder='Chọn size'>
              <Option value='S'>Size S</Option>
              <Option value='M'>Size M</Option>
              <Option value='L'>Size L</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' block>
              Xác nhận đặt hàng
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
