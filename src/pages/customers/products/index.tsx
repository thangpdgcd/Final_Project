import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Alert, Layout, Breadcrumb } from "antd";
import { useNavigate } from "react-router-dom";
import "./index.scss";

import HeaderPage from "../../../components/header";
import { getAllProducts, Product } from "../../../api/productApi";

import FooterPage from "../../../components/footer";
import Chatbox from "../../../components/chatbox";

const { Content } = Layout;

const getImageSrc = (img?: string | null) => {
  if (!img) return "/no-image.png";
  const v = String(img).trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("data:image/")) return v;
  return `data:image/webp;base64,${v}`;
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (e: any) {
        setError(e?.message || "Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className='page-loading'>
        <Spin size='large' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message='Lỗi'
        description={error}
        type='error'
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  return (
    <Layout className='product-page'>
      <HeaderPage />

      <Content className='product-page__content'>
        {/* Breadcrumb */}
        <Breadcrumb className='product-breadcrumb'>
          <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>Sản phẩm</Breadcrumb.Item>
        </Breadcrumb>

        {/* Title */}
        <h1 className='product-page__title'>Cà phê rang xay</h1>
        <p className='product-page__subtitle'>
          Tuyển chọn từ những vùng trồng cà phê chất lượng cao
        </p>

        <Row gutter={[24, 32]}>
          {products.length > 0 ? (
            products.map((p) => (
              <Col xs={24} sm={12} md={8} lg={6} key={p.product_ID}>
                <Card
                  hoverable
                  className='coffee-card'
                  onClick={() => navigate(`/products/${p.product_ID}`)}>
                  {/* IMAGE */}
                  <div className='coffee-card__image'>
                    <img
                      src={getImageSrc(p.image)}
                      alt={p.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/no-image.png";
                      }}
                    />
                  </div>

                  {/* BODY */}
                  <div className='coffee-card__body'>
                    <h3 className='coffee-card__name'>{p.name}</h3>

                    {/* TAGS – sau này có thể map từ DB */}
                    <div className='coffee-card__tags'>
                      <span>Arabica</span>
                      <span>Kon Tum</span>
                      <span>Medium Roast</span>
                    </div>

                    <div className='coffee-card__footer'>
                      <div className='price'>{p.price.toLocaleString()}₫</div>

                      <div className={`stock ${p.stock > 0 ? "in" : "out"}`}>
                        {p.stock > 0 ? `Còn ${p.stock}` : "Hết hàng"}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24} className='empty-text'>
              Không có sản phẩm
            </Col>
          )}
        </Row>
      </Content>
      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default ProductList;
