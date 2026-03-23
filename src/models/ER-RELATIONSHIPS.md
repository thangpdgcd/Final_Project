# Giải thích các liên kết giữa các bảng Model (Database ER)

Tài liệu này mô tả chi tiết các mối quan hệ giữa 8 bảng trong hệ thống backend e-commerce.

---

## 📁 Vị trí file Draw.io

- **File sơ đồ:** `src/models/database-er-diagram.drawio`
- **Cách mở:** Mở bằng [draw.io](https://app.diagrams.net/) (diagrams.net) hoặc extension Draw.io trong VS Code.

---

## 📊 Tổng quan các bảng

| Bảng | Mô tả |
|------|-------|
| **Users** | Người dùng hệ thống (mua hàng, tạo sản phẩm, admin) |
| **Categories** | Danh mục sản phẩm (ví dụ: Cà phê, Trà) |
| **CategoryDetail** | Chi tiết danh mục (xuất xứ, size, roast level, processing) |
| **Products** | Sản phẩm bán |
| **Orders** | Đơn hàng |
| **Order_Items** | Chi tiết từng dòng trong đơn hàng |
| **Carts** | Giỏ hàng |
| **Cart_Items** | Chi tiết sản phẩm trong giỏ hàng |

---

## 🔗 Chi tiết các liên kết

### 1. Users — Orders (1 : N)

- **Loại:** One-to-Many
- **Khóa ngoại:** `Orders.userId` → `Users.userId`
- **Ý nghĩa:** Một người dùng có thể có nhiều đơn hàng.
- **Trong code:**
  - `Users.hasMany(Orders, { foreignKey: "userId" })`
  - `Orders.belongsTo(Users, { foreignKey: "userId" })`

---

### 2. Users — Carts (1 : 1)

- **Loại:** One-to-One
- **Khóa ngoại:** `Carts.userId` → `Users.userId`
- **Ý nghĩa:** Mỗi người dùng có đúng một giỏ hàng.
- **Trong code:**
  - `Users.hasOne(Carts, { foreignKey: "userId" })`
  - `Carts.belongsTo(Users, { foreignKey: "userId" })`

---

### 3. Users — Products (1 : N)

- **Loại:** One-to-Many
- **Khóa ngoại:** `Products.userId` → `Users.userId`
- **Ý nghĩa:** Một người dùng (người bán/admin) có thể tạo nhiều sản phẩm.
- **Trong code:**
  - `Products.belongsTo(Users, { foreignKey: "userId" })`
  - (Phía Users không khai báo `hasMany`, nhưng quan hệ vẫn đúng theo FK)

---

### 4. Categories — CategoryDetail (1 : N)

- **Loại:** One-to-Many
- **Khóa ngoại:** `CategoryDetail.categoriesId` → `Categories.categoriesId`
- **Ý nghĩa:** Một danh mục có nhiều bản ghi chi tiết (ví dụ: nhiều loại cà phê khác nhau trong cùng danh mục).
- **Trong code:**
  - `Categories.hasMany(CategoryDetail, { foreignKey: "categoriesId" })`
  - `CategoryDetail.belongsTo(Categories, { foreignKey: "categoriesId" })`

---

### 5. Categories — Products (1 : N)

- **Loại:** One-to-Many
- **Khóa ngoại:** `Products.categoriesId` → `Categories.categoriesId`
- **Ý nghĩa:** Một danh mục chứa nhiều sản phẩm.
- **Trong code:**
  - `Products.belongsTo(Categories, { foreignKey: "categoriesId" })`

---

### 6. Orders — Order_Items (1 : N)

- **Loại:** One-to-Many
- **Khóa ngoại:** `Order_Items.orderId` → `Orders.orderId`
- **Ý nghĩa:** Một đơn hàng có nhiều dòng chi tiết (mỗi dòng là một sản phẩm + số lượng + giá).
- **Trong code:**
  - `Order_Items.belongsTo(Orders, { foreignKey: "orderId" })`

---

### 7. Products — Order_Items (1 : N)

- **Loại:** One-to-Many
- **Khóa ngoại:** `Order_Items.productId` → `Products.productId`
- **Ý nghĩa:** Một sản phẩm có thể xuất hiện trong nhiều đơn hàng (ở các dòng khác nhau).
- **Trong code:**
  - `Order_Items.belongsTo(Products, { foreignKey: "productId" })`

---

### 8. Carts — Cart_Items (1 : N)

- **Loại:** One-to-Many
- **Khóa ngoại:** `Cart_Items.cartId` → `Carts.cartId`
- **Ý nghĩa:** Một giỏ hàng chứa nhiều dòng (mỗi dòng là một sản phẩm + số lượng + giá).
- **Trong code:**
  - `Carts.hasMany(Cart_Items, { foreignKey: "cartId" })`
  - `Cart_Items.belongsTo(Carts, { foreignKey: "cartId" })`

---

### 9. Products — Cart_Items (1 : N) / Carts — Products (N : M qua Cart_Items)

- **Loại:** Many-to-Many (qua bảng trung gian `Cart_Items`)
- **Khóa ngoại:** `Cart_Items.productId` → `Products.productId` và `Cart_Items.cartId` → `Carts.cartId`
- **Ý nghĩa:**
  - Một sản phẩm có thể nằm trong nhiều giỏ hàng (của nhiều người).
  - Một giỏ hàng có thể chứa nhiều sản phẩm.
- **Bảng trung gian:** `Cart_Items` lưu thêm `quantity`, `price`.
- **Trong code:**
  - `Products.belongsToMany(Carts, { through: Cart_Items, foreignKey: "productId", otherKey: "cartId" })`
  - `Carts.belongsToMany(Products, { through: Cart_Items, foreignKey: "cartId", otherKey: "productId" })`
  - `Cart_Items.belongsTo(Products)` và `Cart_Items.belongsTo(Carts)`

---

## 📐 Sơ đồ luồng logic (ASCII)

```
                    Users
                 /   |   \
                /    |    \
               /     |     \
          Orders  Carts   Products
             |      |         |
             |      |         +----> Categories
             |      |         |           |
             |      |         |      CategoryDetail
             |      |         |
         Order_Items  Cart_Items
              \         /
               \       /
                \     /
               Products
```

---

## 🎯 Luồng dữ liệu chính

1. **Đặt hàng:** User → Carts → Cart_Items (Products) → Orders → Order_Items (Products)
2. **Quản lý sản phẩm:** User tạo Product → Product thuộc Category → Category có CategoryDetail
3. **Truy vấn:** Dùng `include` trong Sequelize để join theo các liên kết trên (ví dụ: `Orders` include `Order_Items` include `Products`).

---

**Cập nhật:** 13/03/2025
