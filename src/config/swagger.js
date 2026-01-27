import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Swagger API for system",
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication APIs",
      },
      {
        name: "Users",
        description: "User management APIs",
      },

      {
        name: "Cart",
        description: "Shopping cart APIs",
      },
      {
        name: "Orders",
        description: "Order management APIs",
      },
      {
        name: "Payments",
        description: "Payment management APIs",
      },
      {
        name: "Products",
        description: "Product management APIs",
      },
    ],
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./**/*.js"], // nơi viết comment swagger
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
