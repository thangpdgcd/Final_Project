import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath, pathToFileURL } from "url";
import { loadEnv } from "../config/runtimeEnv.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load `.env` early so Sequelize reads from a stable env source.
loadEnv();

/** Dynamic import so this runs after `dotenv` above; `config.cjs` also loads `.env` by absolute path. */
const { default: configModule } = await import("../config/config.cjs");
// Ensure we use the correct DB TLS settings on TiDB Cloud even if NODE_ENV
// isn't set to "production" on the hosting platform.
//setup tidb cloud connection on production environment
const inferredEnv =
  process.env.DB_HOST && process.env.DB_HOST.toLowerCase().includes("tidbcloud")
    ? "production"
    : undefined;
const env = process.env.NODE_ENV || inferredEnv || "development";
const config = configModule[env];
if (!config) {
  throw new Error(
    `Missing Sequelize config for env "${env}". Check NODE_ENV and src/config/config.cjs.`,
  );
}

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
  const ModelClass = modelImport.default(sequelize, DataTypes);
  // Prefer Sequelize modelName (stable); avoid relying on class `name` alone.
  const registryKey = ModelClass.options?.modelName ?? ModelClass.name;
  db[registryKey] = ModelClass;
}

// Module-owned models (kept outside src/models/)
const moduleModelDirs = [
  path.resolve(__dirname, "../modules/chat/chat.models"),
  path.resolve(__dirname, "../modules/order/order.models"),
];

for (const dir of moduleModelDirs) {
  if (!fs.existsSync(dir)) continue;
  const moduleFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));
  for (const file of moduleFiles) {
    const filePath = path.join(dir, file);
    const fileUrl = pathToFileURL(filePath).href;
    const modelImport = await import(fileUrl);
    const ModelClass = modelImport.default(sequelize, DataTypes);
    const registryKey = ModelClass.options?.modelName ?? ModelClass.name;
    db[registryKey] = ModelClass;
  }
}

Object.keys(db).forEach((modelName) => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
