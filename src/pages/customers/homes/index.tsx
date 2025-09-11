import React from "react";
import { Layout, Menu, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import bannerImage from "../../../assets/img/backgroud_PhanCoffee.png";
import bannerrobusta from "../../../assets/img/vn-11134207-7r98o-lkry006ov074b2_tn.jpg";
import "./index.scss";

const { Header, Content, Footer } = Layout;
const { Meta } = Card;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <Layout className='homepage'>
      {/* ===== HEADER ===== */}
      <Header className='homepage__header'>
        <div className='homepage__logo'>
          <img src={logo} alt='Phan Coffee' />
          <span>Phan Coffee</span>
        </div>

        <Menu
          mode='horizontal'
          overflowedIndicator={false} // 🚀 hiển thị hết menu, không bị "..."
          defaultSelectedKeys={["home"]}
          onClick={handleMenuClick}
          items={[
            { key: "home", label: "Trang chủ" },
            { key: "products", label: "Sản phẩm" },
            { key: "contact", label: "Liên hệ" },
            { key: "login", label: "Đăng nhập" },
          ]}
        />
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className='homepage__content'>
        {/* Hero Section */}
        <div
          className='homepage__hero'
          style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className='homepage__hero-overlay'>
            <div className='homepage__hero-buttons'>
              <Button type='primary' size='large'>
                Xem Thêm
              </Button>
              <Button size='large' style={{ marginLeft: "12px" }}>
                Sản Phẩm
              </Button>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className='homepage__services'>
          <div className='homepage__services-grid'>
            <Card
              hoverable
              cover={<img alt='Ocean Freight' src={bannerrobusta} />}>
              <Meta
                title='ROBUSTA PHAN COFFEE'
                description='It is a long established fact that a reader will be distracted by the readable content.'
              />
            </Card>
            <Card
              hoverable
              cover={<img alt='Air Freight' src={bannerrobusta} />}>
              <Meta
                title='AIR FREIGHT'
                description='It is a long established fact that a reader will be distracted by the readable content.'
              />
            </Card>
            <Card
              hoverable
              cover={<img alt='Street Freight' src={bannerrobusta} />}>
              <Meta
                title='STREET FREIGHT'
                description='It is a long established fact that a reader will be distracted by the readable content.'
              />
            </Card>
          </div>
        </div>
      </Content>

      {/* ===== FOOTER ===== */}
      <Footer className='homepage__footer'>
        © {new Date().getFullYear()} CoffeeShop. All rights reserved.
      </Footer>
    </Layout>
  );
};

export default HomePage;
