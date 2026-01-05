import React, { useEffect, useState } from "react";
import "./index.scss";
import { Row, Col, Card, Spin, Alert, Layout, Menu } from "antd";
import { getAllProducts, Product } from "../../../api/productApi";
import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import { useNavigate } from "react-router-dom";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Header } = Layout;

/** ✅ helper ảnh: URL | data:image | base64 thuần */
const getImageSrc = (img?: string | null) => {
  if (!img) return "/no-image.png";
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("data:image/")) return v;
  return `data:image/webp;base64,${v}`; // đổi webp->jpeg nếu bạn lưu jpeg
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contact",
    login: "/login",
    about: "/about",
    carts: "/carts",
  };

  const handleMenuClick = (e: { key: string }) => {
    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  const goDetail = (id: number) => navigate(`/products/${id}`);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size='large' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message='Error'
        description={error}
        type='error'
        showIcon
        style={{ margin: 20 }}
      />
    );
  }

  return (
    <Layout>
      <Header className='homepage__header'>
        <div className='homepage__logo ' onClick={() => navigate("/")}>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        <div style={{ flex: 1 }} />

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
            {
              key: "carts",
              label: (
                <div className='menu-cart'>
                  <span className='menu-cart-icon text-2xl'>
                    <ShoppingCartOutlined
                      className='icon-carts'
                      style={{ fontSize: 24 }}
                    />
                  </span>
                </div>
              ),
            },
          ]}
        />
      </Header>

      <div className='product-list' style={{ padding: 20 }}>
        <Row gutter={[16, 16]}>
          {products.length > 0 ? (
            products.map((p) => (
              <Col xs={24} sm={12} md={8} lg={6} key={p.product_ID}>
                <Card
                  hoverable
                  onClick={() => goDetail(p.product_ID)}
                  cover={
                    <img
                      src={getImageSrc(p.image)}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/no-image.png";
                      }}
                    />
                  }>
                  <Card.Meta
                    title={p.name}
                    description={
                      <>
                        <p>Price: {p.price.toLocaleString()}₫</p>
                        <p>Stock: {p.stock}</p>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: "center" }}>
              <p>No products found.</p>
            </Col>
          )}
        </Row>
      </div>
    </Layout>
  );
};

export default ProductList;
