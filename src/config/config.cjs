const path = require("path");
// Always load backend root `.env` (not cwd-dependent). `config.cjs` lives in `src/config/`.
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    // Prefer DB_PASS so project `.env` wins over a stray global DB_PASSWORD on the machine.
    password: process.env.DB_PASS || process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "coffee_production",
    host: process.env.DB_HOST || "127.0.0.1", 
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
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
    dialectOptions: {
      ssl: {
        // TiDB Cloud serverless usually requires TLS.
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
