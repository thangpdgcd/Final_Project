import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Table, Button, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import SearchComponent from "../../search";
import FooterPage from "../../footer";
import "./index.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const OrderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🛍️ Dữ liệu giỏ hàng được truyền từ PageCart
  const cartItems = location.state?.cartItems || [];

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: ["products", "name"],
      key: "name",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: ["products", "price"],
      key: "price",
      render: (price: number) => `${price?.toLocaleString()}₫`,
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_: any, record: any) =>
        `${(
          (record.products?.price || 0) * record.quantity
        ).toLocaleString()}₫`,
    },
  ];

  const totalAmount = cartItems.reduce(
    (sum: number, item: any) =>
      sum + (item.products?.price || 0) * item.quantity,
    0
  );

  // 🌐 Menu điều hướng
  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contact",
    about: "/about",
    login: "/login",
    carts: "/carts",
  };

  const handleMenuClick = (e: { key: string }) => {
    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  const menuItems = [
    { key: "home", label: "Home" },
    { key: "products", label: "Coffee" },
    { key: "contact", label: "Contact" },
    { key: "about", label: "About" },
    { key: "login", label: "Log In" },
    {
      key: "carts",
      label: (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "100%",
          }}>
          <ShoppingCartOutlined style={{ fontSize: 20, color: "#000" }} />
        </span>
      ),
    },
  ];

  return (
    <Layout className='order-page'>
      {/* ===== HEADER (from HomePage) ===== */}
      <Header className='homepage__header'>
        <div className='homepage__logo'>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        <SearchComponent />

        <Menu
          mode='horizontal'
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className='menu-home'
          items={menuItems}
        />
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className='order-content' style={{ padding: "24px" }}>
        <Title level={3}>🧾 Xác nhận đơn hàng</Title>
        <Table
          columns={columns}
          dataSource={cartItems}
          rowKey='cartitem_ID'
          pagination={false}
        />

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Title level={4}>Tổng cộng: {totalAmount.toLocaleString()}₫</Title>
          <Button
            type='primary'
            size='large'
            onClick={() => navigate("/", { state: { cartItems } })}>
            Xác nhận đặt hàng
          </Button>
          {/* button paypal điều kiện-> khi ng dùng bấm và ẩn button xác nhận đơn hàng và hiện ra paypal*/}
        </div>
      </Content>

      {/* ===== FOOTER (giống HomePage) ===== */}
      <FooterPage />
    </Layout>
  );
};

export default OrderPage;
