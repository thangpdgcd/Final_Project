import React, { useEffect, useState } from "react";
import { Card, Row, Col, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { getAllCartItems } from "../../api/cartItemApi";

const { Title } = Typography;

interface CartItem {
  cartitem_ID: number;
  product_ID: number;
  quantity: number;
  product?: {
    name: string;
    price: number;
    image?: string;
  };
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const data = await getAllCartItems();
      setCartItems(data);
    } catch (err) {
      message.error("Không thể tải giỏ hàng");
    }
  };

  const handleClick = (cartitem_ID: number) => {
    navigate(`/cart-item/${cartitem_ID}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🛒 Giỏ hàng của bạn</Title>
      <Row gutter={[16, 16]}>
        {cartItems.map((item) => (
          <Col key={item.cartitem_ID} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => handleClick(item.cartitem_ID)}
              cover={
                item.product?.image ? (
                  <img alt={item.product.name} src={item.product.image} />
                ) : null
              }>
              <Card.Meta
                title={item.product?.name || `Product #${item.product_ID}`}
                description={`Giá: ${(
                  item.product?.price || 0
                ).toLocaleString()}₫ | Số lượng: ${item.quantity}`}
              />
            </Card>
          </Col>
        ))}
      </Row>
      {cartItems.length === 0 && <p>Giỏ hàng trống</p>}
    </div>
  );
};

export default CartPage;
