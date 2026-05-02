import { describe, jest, test, expect, beforeEach } from "@jest/globals";

// Note: This repository uses ESM. We mock `src/models/index.js` before importing
// `productsService` to avoid connecting to the real database.

describe("productsService.createProducts", () => {
  const dbMock = {
    Products: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Categories: {
      findOne: jest.fn(),
    },
    Users: {
      findOne: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Scenario 1: Missing required name rejects with required-parameter message", async () => {
    jest.unstable_mockModule("../models/index.js", () => ({
      default: dbMock,
    }));

    const { default: productsService } = await import("./productsService.js");

    const data = {
      // missing `name`
      image: "https://example.com/img.jpg",
      price: 35000,
      description: "Tasty",
      category: "Coffee",
      size: "250ml",
      staffId: 1,
      // productsService.createProducts expects categoriesId + userId
      categoriesId: 1,
      userId: 2,
    };

    await expect(productsService.createProducts(data)).rejects.toThrow(
      "Please provide Name, Price, CategoriesId and UserId.",
    );
    expect(dbMock.Products.findOne).not.toHaveBeenCalled();
  });

  test("Scenario 2: All required fields provided resolves successfully", async () => {
    jest.unstable_mockModule("../models/index.js", () => ({
      default: dbMock,
    }));

    const { default: productsService } = await import("./productsService.js");

    dbMock.Products.findOne.mockResolvedValue(null);
    dbMock.Categories.findOne.mockResolvedValue({ categoriesId: 1 });
    dbMock.Users.findOne.mockResolvedValue({ userId: 2 });

    const createdProduct = { productId: 10, name: "Iced Milk Coffee" };
    dbMock.Products.create.mockResolvedValue(createdProduct);

    const data = {
      name: "Iced Milk Coffee",
      price: 35000,
      description: "Delicious iced milk coffee",
      image: "https://example.com/milk-coffee.jpg",
      // productsService.createProducts expects categoriesId + userId
      categoriesId: "1",
      userId: "2",
      stock: 0,
    };

    const result = await productsService.createProducts(data);
    expect(result).toEqual(createdProduct);
    expect(dbMock.Products.create).toHaveBeenCalled();
  });
});

