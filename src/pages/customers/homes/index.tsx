import React from "react";
import { Layout, Menu, Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // ánh xạ key -> path
  const menuRoutes: Record<string, string> = {
    "1": "/",
    "2": "/about",
    "3": "/contact",
    login: "/login",
  };

  const handleMenuClick = (e: { key: string }) => {
    const path = menuRoutes[e.key];
    if (path) {
      navigate(path);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <div
          onClick={() => navigate("/")}
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            cursor: "pointer",
          }}>
          MyApp
        </div>
        <Menu
          theme='dark'
          mode='horizontal'
          defaultSelectedKeys={["1"]}
          onClick={handleMenuClick}
          items={[
            { key: "1", label: "Home" },
            { key: "2", label: "About" },
            { key: "3", label: "Contact" },
            { key: "login", label: "Login" },
          ]}
        />
      </Header>

      {/* Content */}
      <Content style={{ padding: "50px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Title level={2}>Welcome to MyApp 🚀</Title>
          <Paragraph>
            Đây là trang Home cơ bản sử dụng Ant Design Layout. Bạn có thể thêm
            banner, cards, hoặc section khác vào đây.
          </Paragraph>
          <Button type='primary' size='large'>
            Bắt đầu ngay
          </Button>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: "center" }}>
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </Footer>
    </Layout>
  );
};

export default HomePage;
