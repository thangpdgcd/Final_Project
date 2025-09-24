import React, { useEffect, useState } from "react";
import {
  Table,
  InputNumber,
  Button,
  Popconfirm,
  message,
  Typography,
} from "antd";
import {
  getAllCartItems,
  updateCartItem,
  deleteCartItem,
} from "../../api/cartItemApi";

const { Text } = Typography;

interface CartItem {
  cartitem_ID: number;
  cart_ID: number;
  product_ID: number;
  quantity: number;
  price: number;
  productName?: string;
}

const CartItems: React.FC = () => {
  const [cartitems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const data = await getAllCartItems();
      setCartItems(data);
    } catch (err) {
      message.error("Lỗi khi lấy giỏ hàng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (id: number, quantity: number) => {
    if (quantity <= 0) return;
    try {
      await updateCartItem(id, { quantity });
      setCartItems(
        cartitems.map((item) =>
          item.cartitem_ID === id ? { ...item, quantity } : item
        )
      );
      message.success("Cập nhật số lượng thành công");
    } catch (err) {
      message.error("Cập nhật thất bại");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCartItem(id);
      setCartItems(cartitems.filter((item) => item.cartitem_ID !== id));
      message.success("Xoá sản phẩm thành công");
    } catch (err) {
      message.error("Xoá thất bại");
      console.error(err);
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: CartItem) =>
        text || `Product #${record.product_ID}`,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString()}₫`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) =>
            handleQuantityChange(record.cartitem_ID, value as number)
          }
        />
      ),
    },
    {
      title: "Tổng",
      key: "total",
      render: (_: any, record: CartItem) => (
        <Text strong>{(record.price * record.quantity).toLocaleString()}₫</Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: CartItem) => (
        <Popconfirm
          title='Bạn có chắc muốn xoá sản phẩm này?'
          onConfirm={() => handleDelete(record.cartitem_ID)}
          okText='Xoá'
          cancelText='Huỷ'>
          <Button type='primary' danger>
            Xoá
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Giỏ hàng của bạn</h2>
      <Table
        rowKey='cartitem_ID'
        dataSource={cartitems}
        columns={columns}
        loading={loading}
        pagination={false}
      />
      {cartitems.length === 0 && !loading && <p>Giỏ hàng trống</p>}
    </div>
  );
};

export default CartItems;
