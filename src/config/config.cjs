require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "coffee",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME_TEST || "coffee_test",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: process.env.DB_USER || "root",
    // Hosting TiDB (tidbcloud) uses DB_PASSWORD in your `.env`
    password: process.env.DB_PASSWORD || process.env.DB_PASS || null,
    database: process.env.DB_NAME_PROD || process.env.DB_NAME || "coffee_production",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    dialect: "mysql",
    // TiDB Cloud serverless thường yêu cầu TLS.
    // rejectUnauthorized:false giúp bạn dùng nhanh (không verify CA) cho môi trường triển khai.
    dialectOptions: {
      ssl: {
        // Force TLS encryption for TiDB Cloud.
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
