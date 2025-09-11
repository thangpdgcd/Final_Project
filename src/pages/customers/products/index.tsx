import React, { useEffect, useState } from "react";
import { getAllProducts, Product } from "../../../api/productApi";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getAllProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error:", err.message));
  }, []);

  return (
    <div>
      <h1>Danh sách sản phẩm</h1>
      {products.map((p) => (
        <div key={p.product_ID}>
          <h3>{p.name}</h3>
          <p>Giá: {p.price}đ</p>
          <p>Số lượng: {p.stock}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
