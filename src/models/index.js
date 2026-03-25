import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import configModule from "../config/config.cjs";
// Ensure we use the correct DB TLS settings on TiDB Cloud even if NODE_ENV
// isn't set to "production" on the hosting platform.
const inferredEnv =
  process.env.DB_HOST && process.env.DB_HOST.toLowerCase().includes("tidbcloud")
    ? "production"
    : undefined;
const env = process.env.NODE_ENV || inferredEnv || "development";
const config = configModule[env];

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const files = fs
  .readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"));

for (const file of files) {
  const filePath = path.join(__dirname, file);
  const fileUrl = pathToFileURL(filePath).href;
  const modelImport = await import(fileUrl);
  const model = modelImport.default(sequelize, DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
