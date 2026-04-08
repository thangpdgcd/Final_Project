import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// swagger-jsdoc resolves `apis` relative to the current working directory (CWD),
// so make it deterministic regardless of how we start the server.
// We only scan route files (where `@swagger` comments live).
const routesGlob = path
  .join(__dirname, "..", "routes", "**", "*.js")
  .replace(/\\/g, "/");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description:
        "API docs. Use **Authorize** and paste `accessToken` from POST /api/login (`data.accessToken` in the response body).",
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT only (or full `Bearer <token>`). From POST /api/login → `data.accessToken`.",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [routesGlob],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
