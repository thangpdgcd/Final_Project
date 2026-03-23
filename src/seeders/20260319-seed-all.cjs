"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1) Users (parent)
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          user_ID: 1,
          name: "Admin",
          email: "admin@example.com",
          address: "HCM",
          phoneNumber: "0900000001",
          password: "$2b$10$seeded-password-hash-placeholder",
          roleID: "2",
          createdAt: now,
          updatedAt: now,
        },
        {
          user_ID: 2,
          name: "User One",
          email: "user1@example.com",
          address: "HCM",
          phoneNumber: "0900000002",
          password: "$2b$10$seeded-password-hash-placeholder",
          roleID: "1",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );

    // 2) Categories (parent of Products + category_details)
    await queryInterface.bulkInsert(
      "Categories",
      [
        {
          categories_ID: 1,
          name: "Coffee (Phin)",
          description: "Cà phê phin truyền thống",
          createdAt: now,
          updatedAt: now,
        },
        {
          categories_ID: 2,
          name: "Coffee (Espresso)",
          description: "Cà phê máy / Espresso-based",
          createdAt: now,
          updatedAt: now,
        },
        {
          categories_ID: 3,
          name: "Tea",
          description: "Trà trái cây",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );

    // 3) category_details (child of Categories)
    await queryInterface.bulkInsert(
      "category_details",
      [
        {
          category_detail_ID: 1,
          origin: "Vietnam",
          size: "M",
          roastLevel: "Medium",
          processing: "Washed",
          categories_ID: 1,
        },
        {
          category_detail_ID: 2,
          origin: "Brazil",
          size: "M",
          roastLevel: "Medium-Dark",
          processing: "Natural",
          categories_ID: 2,
        },
      ],
      {}
    );

    // 4) Products (child of Users + Categories)
    await queryInterface.bulkInsert(
      "Products",
      [
        {
          product_ID: 1,
          name: "Cà phê Đen Đá",
          user_ID: 1,
          categories_ID: 1,
          description: "Cà phê robusta pha phin, đậm vị.",
          price: 25000,
          stock: 100,
          image: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          product_ID: 2,
          name: "Cà phê Sữa Đá",
          user_ID: 1,
          categories_ID: 1,
          description: "Cà phê phin sữa đá, vị ngọt béo.",
          price: 30000,
          stock: 120,
          image: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          product_ID: 3,
          name: "Latte",
          user_ID: 1,
          categories_ID: 2,
          description: "Espresso + sữa, foam mịn.",
          price: 45000,
          stock: 80,
          image: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          product_ID: 4,
          name: "Trà Đào Cam Sả",
          user_ID: 1,
          categories_ID: 3,
          description: "Trà đào mix cam sả.",
          price: 40000,
          stock: 90,
          image: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );

    // 5) Carts (child of Users)
    await queryInterface.bulkInsert(
      "Carts",
      [
        {
          cart_ID: 1,
          user_ID: 2,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );

    // 6) Cart_Items (child of Carts + Products)
    await queryInterface.bulkInsert(
      "Cart_Items",
      [
        {
          cartitem_ID: 1,
          cart_ID: 1,
          product_ID: 1,
          quantity: 2,
          price: 25000,
          createdAt: now,
          updatedAt: now,
        },
        {
          cartitem_ID: 2,
          cart_ID: 1,
          product_ID: 3,
          quantity: 1,
          price: 45000,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );

    // 7) Orders (child of Users)
    await queryInterface.bulkInsert(
      "Orders",
      [
        {
          order_ID: 1,
          user_ID: 2,
          total_Amount: 95000,
          status: "Paid",
          shipping_Address: "HCM",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );

    // 8) Order_Items (child of Orders + Products)
    await queryInterface.bulkInsert(
      "Order_Items",
      [
        {
          orderitem_ID: 1,
          order_ID: 1,
          product_ID: 1,
          quantity: 2,
          price: 25000,
          createdAt: now,
          updatedAt: now,
        },
        {
          orderitem_ID: 2,
          order_ID: 1,
          product_ID: 3,
          quantity: 1,
          price: 45000,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );

    // 9) Payments (child-ish; migration doesn't enforce FK)
    await queryInterface.bulkInsert(
      "Payments",
      [
        {
          payment_ID: 1,
          orderitem_ID: 1,
          payment_method: "paypal",
          payment_status: "completed",
          amount: 95000,
          paid: true,
          transaction_ID: "SEED_TX_001",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // delete children first, then parents
    await queryInterface.bulkDelete("Payments", null, {});
    await queryInterface.bulkDelete("Order_Items", null, {});
    await queryInterface.bulkDelete("Orders", null, {});
    await queryInterface.bulkDelete("Cart_Items", null, {});
    await queryInterface.bulkDelete("Carts", null, {});
    await queryInterface.bulkDelete("Products", null, {});
    await queryInterface.bulkDelete("category_details", null, {});
    await queryInterface.bulkDelete("Categories", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};

