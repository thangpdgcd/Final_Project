"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const cloudinaryImages = [
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774341025/1c1613af-32ea-404d-9f1d-f98ab354bcfb.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774341023/b6399559-a934-400d-8ee7-f7c82bdc77bf.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774341006/45dbab92-d419-4721-9b0e-cd955754b0c1.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340972/3a353244-a82a-4eb7-aa22-41848b7368ae.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340967/c8224f39-e286-4ad5-ae00-e0d5972b1bf8.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806942/7c8fdf33-e788-43fa-9289-04cfc046bc26.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806899/728d1804-9ff5-4605-80ae-2af9df043b54.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806896/91225c08-832a-40fc-80a2-ee0b4b255dae.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806875/885f5dab-9dd8-49fd-9684-dbc5814080e8.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806793/caa99843-4323-480a-b4ac-33db5727332f.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806723/78ed0307-e4e3-4e4f-bb6d-ddbf33049f7b.png",
    ];

    const categoriesToEnsure = [
      "Stationery",
      "Electronics",
      "Accessories",
      "Office Tools",
    ];

    const productPayload = [
      // Existing seed products (kept)
      {
        name: "Vietnamese Black Coffee",
        description: "Strong iced black coffee brewed by phin filter",
        price: 25000,
        stock: 120,
        image:
          "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340894/20cc4c6c-0d74-4c8a-9840-b610ea917478.png",
        categoryName: "Coffee",
      },
      {
        name: "Vietnamese Milk Coffee",
        description: "Classic milk coffee with condensed milk",
        price: 30000,
        stock: 100,
        image:
          "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340865/276204cb-0a4b-405c-9506-5f3d22de5b2e.png",
        categoryName: "Coffee",
      },
      {
        name: "Peach Tea",
        description: "Peach tea with fruit slices",
        price: 40000,
        stock: 80,
        image:
          "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340916/b8d612ba-cde2-4f0d-975c-aa68855193e9.png",
        categoryName: "Tea",
      },
      {
        name: "Butter Croissant",
        description: "Baked buttery croissant",
        price: 35000,
        stock: 60,
        image:
          "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340948/46279eb4-1a7f-4a1f-997b-b1e01363c5ee.png",
        categoryName: "Bakery",
      },

      // New e-commerce products (requested)
      {
        name: "Premium Notebook A5",
        price: 6.99,
        description:
          "A5 hardcover notebook with smooth, ink-friendly pages for daily notes.",
        image: cloudinaryImages[0],
        categoryName: "Stationery",
      },
      {
        name: "Gel Pen Set (10-pack)",
        price: 4.5,
        description:
          "Quick-drying gel pen set with consistent ink flow for clean writing.",
        image: cloudinaryImages[1],
        categoryName: "Stationery",
      },
      {
        name: "Wireless Mouse",
        price: 12.99,
        description:
          "Comfortable wireless mouse with reliable connection and long battery life.",
        image: cloudinaryImages[2],
        categoryName: "Electronics",
      },
      {
        name: "USB-C Fast Charger (30W)",
        price: 14.99,
        description:
          "Compact USB-C charger for phones and tablets with 30W fast charging.",
        image: cloudinaryImages[3],
        categoryName: "Electronics",
      },
      {
        name: "Laptop Stand (Aluminum)",
        price: 18.75,
        description:
          "Sturdy aluminum stand to improve ergonomics and airflow for laptops.",
        image: cloudinaryImages[4],
        categoryName: "Office Tools",
      },
      {
        name: "Desk Organizer Tray",
        price: 9.25,
        description:
          "Multi-compartment tray to keep stationery and small items neatly arranged.",
        image: cloudinaryImages[5],
        categoryName: "Office Tools",
      },
      {
        name: "Keychain Card Holder",
        price: 5.49,
        description:
          "Minimal card holder keychain for essentials—lightweight and easy to carry.",
        image: cloudinaryImages[6],
        categoryName: "Accessories",
      },
      {
        name: "Reusable Water Bottle (600ml)",
        price: 7.99,
        description:
          "Everyday reusable bottle with secure cap—great for office and commuting.",
        image: cloudinaryImages[7],
        categoryName: "Accessories",
      },
      {
        name: "Portable Bluetooth Speaker",
        price: 22.5,
        description:
          "Compact Bluetooth speaker with clear sound for desk setup or travel.",
        image: cloudinaryImages[8],
        categoryName: "Electronics",
      },
      {
        name: "Sticky Notes (Pastel Pack)",
        price: 2.99,
        description: "Pastel sticky notes for reminders, bookmarks, and quick planning.",
        image: cloudinaryImages[9],
        categoryName: "Stationery",
      },
      {
        name: "Cable Management Clips",
        price: 3.49,
        description: "Adhesive cable clips to keep charging cables tidy and within reach.",
        image: cloudinaryImages[10],
        categoryName: "Office Tools",
      },
    ];

    await queryInterface.sequelize.transaction(async (transaction) => {
      // Pick a valid owner user_ID (prefer admin roleID="2", else first user).
      const admin = await queryInterface.sequelize.query(
        "SELECT user_ID, email FROM Users WHERE roleID = '2' ORDER BY user_ID ASC LIMIT 1",
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      const anyUser =
        admin && admin.length
          ? admin
          : await queryInterface.sequelize.query(
              "SELECT user_ID, email FROM Users ORDER BY user_ID ASC LIMIT 1",
              { type: Sequelize.QueryTypes.SELECT, transaction }
            );
      if (!anyUser || anyUser.length === 0) {
        throw new Error(
          'No users found. Seed Users first so Products can reference a valid "user_ID".'
        );
      }
      const ownerUserId = anyUser[0].user_ID;

      // Ensure categories exist by name (keep old data; insert only missing).
      const allCategoryNames = Array.from(
        new Set([...categoriesToEnsure, "Coffee", "Tea", "Bakery"])
      );

      const existingCategories = await queryInterface.sequelize.query(
        "SELECT categories_ID, name FROM Categories WHERE name IN (:names)",
        {
          replacements: { names: allCategoryNames },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      const categoryByName = new Map(
        existingCategories.map((c) => [c.name, c.categories_ID])
      );

      const missingCategoryNames = allCategoryNames.filter(
        (name) => !categoryByName.has(name)
      );

      if (missingCategoryNames.length > 0) {
        const newCategories = missingCategoryNames.map((name) => ({
          name,
          description: null,
          createdAt: now,
          updatedAt: now,
        }));

        await queryInterface.bulkInsert("Categories", newCategories, {
          transaction,
        });

        const inserted = await queryInterface.sequelize.query(
          "SELECT categories_ID, name FROM Categories WHERE name IN (:names)",
          {
            replacements: { names: missingCategoryNames },
            type: Sequelize.QueryTypes.SELECT,
            transaction,
          }
        );
        for (const c of inserted) {
          categoryByName.set(c.name, c.categories_ID);
        }
      }

      // Build Products rows with resolved categories_ID and idempotently insert new ones.
      const rows = productPayload.map((p) => {
        const categories_ID = categoryByName.get(p.categoryName);
        if (!categories_ID) {
          throw new Error(`Missing category "${p.categoryName}" for product "${p.name}".`);
        }

        return {
          name: p.name,
          user_ID: ownerUserId,
          categories_ID,
          description: p.description ?? null,
          price: p.price,
          stock: p.stock ?? 100,
          image: p.image ?? null,
          createdAt: now,
          updatedAt: now,
        };
      });

      const names = rows.map((r) => r.name);
      const categoryIds = Array.from(new Set(rows.map((r) => r.categories_ID)));

      const existingProducts = await queryInterface.sequelize.query(
        "SELECT name, categories_ID FROM Products WHERE name IN (:names) AND categories_ID IN (:categoryIds)",
        {
          replacements: { names, categoryIds },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );
      const existingKeys = new Set(
        existingProducts.map((r) => `${r.name}::${r.categories_ID}`)
      );

      const toInsert = rows.filter(
        (r) => !existingKeys.has(`${r.name}::${r.categories_ID}`)
      );

      if (toInsert.length === 0) {
        console.log("✅ Products already exist - nothing to seed.");
        return;
      }

      await queryInterface.bulkInsert("Products", toInsert, { transaction });
      console.log(`✅ Seeded ${toInsert.length} new product(s).`);
    });
  },

  async down(queryInterface, Sequelize) {
    const allImages = [
      // old products
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340894/20cc4c6c-0d74-4c8a-9840-b610ea917478.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340865/276204cb-0a4b-405c-9506-5f3d22de5b2e.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340916/b8d612ba-cde2-4f0d-975c-aa68855193e9.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340948/46279eb4-1a7f-4a1f-997b-b1e01363c5ee.png",
      // new products (requested)
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774341025/1c1613af-32ea-404d-9f1d-f98ab354bcfb.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774341023/b6399559-a934-400d-8ee7-f7c82bdc77bf.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774341006/45dbab92-d419-4721-9b0e-cd955754b0c1.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340972/3a353244-a82a-4eb7-aa22-41848b7368ae.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340967/c8224f39-e286-4ad5-ae00-e0d5972b1bf8.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806942/7c8fdf33-e788-43fa-9289-04cfc046bc26.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806899/728d1804-9ff5-4605-80ae-2af9df043b54.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806896/91225c08-832a-40fc-80a2-ee0b4b255dae.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806875/885f5dab-9dd8-49fd-9684-dbc5814080e8.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806793/caa99843-4323-480a-b4ac-33db5727332f.png",
      "https://res.cloudinary.com/dfjecxrnl/image/upload/v1775806723/78ed0307-e4e3-4e4f-bb6d-ddbf33049f7b.png",
    ];

    await queryInterface.bulkDelete("Products", { image: allImages }, {});
  },
};
