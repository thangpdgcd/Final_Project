**Project Documentation**

This document describes the backend project layout, how modules connect, request/response flow, configuration, and key implementation details. Use this as a reference for development, debugging, or onboarding.

**Repository Summary**

- **Name:** `backend` (Node.js + Express + Sequelize)
- **Main entry:** `server.js` (in `src/`)
- **ORM:** `Sequelize` with MySQL (`mysql2`)
- **Auth:** JWT (`jsonwebtoken`) with middleware in `src/middlewares/auth.js`
- **File upload / images:** Cloudinary + `multer` / `multer-storage-cloudinary`

**Directory Structure (top-level)**

| Path           | Type | Purpose                                               |
| -------------- | ---: | ----------------------------------------------------- |
| `server.js`    | file | App entry (sets up Express, routes, middleware, CORS) |
| `package.json` | file | Dependencies and start script                         |
| `.env`         | file | Environment variables (DB, JWT, Cloudinary)           |
| `src/`         |  dir | Application source code                               |

Inside `src/` (important subfolders):

| Path                       | Type | Purpose                                                               |
| -------------------------- | ---: | --------------------------------------------------------------------- |
| `src/config/`              |  dir | App configuration utilities (`db.js`, `config.cjs`, `viewEngine.js`)  |
| `src/models/`              |  dir | Sequelize model definitions and `index.js` bootstrapping              |
| `src/controllers/`         |  dir | Express controllers — parse request, call services, return response   |
| `src/service/`             |  dir | Business logic and DB interaction wrappers (used by controllers)      |
| `src/routes/`              |  dir | Route registration functions that attach endpoints to the Express app |
| `src/middlewares/`         |  dir | Middlewares (auth, role checks)                                       |
| `src/cloudinaryConfig.js`  | file | Cloudinary client configuration                                       |
| `src/upload.js`            | file | Upload helper (multer/cloudinary integration)                         |
| `views/`                   |  dir | EJS templates used when rendering HTML responses                      |
| `migrations/` & `seeders/` |  dir | Sequelize migrations and seed scripts                                 |

**High-level flow (ASCII diagram)**

Client -> `routes` -> `controllers` -> `services` -> `models` -> MySQL (via Sequelize)

+-----------+ +---------+ +------------+ +---------+ +--------+
| Client | --> | Routes | --> | Controllers| --> | Services| --> | Models |
+-----------+ +---------+ +------------+ +---------+ +--------+
^ |
| v
Middlewares Sequelize
(auth, roles) DB

Notes:

- `routes/*.js` export a function `initX(app)` which is called by `server.js` to mount endpoints.
- Controllers are thin: they validate/parse request data and call `service/*` functions.
- Services encapsulate database logic and return Promises/objects to controllers.

Example request lifecycle (GET products):

1. Client calls `GET /products`.
2. Route handler in `src/routes/productsRoutes.js` routes to `productsController.getAllProducts`.
3. Controller calls `productsService.getAllProducts()`.
4. Service uses `db.Products.findAll(...)` (Sequelize model) and includes associations (`categories`, `users`).
5. Service returns JSON; controller sends `res.json(...)`.

**Key files and responsibilities**

- `server.js` (`src/server.js`)

  - Loads environment with `dotenv`.
  - Configures Express middleware: `express.json`, `body-parser`, CORS (`origin: http://localhost:3000`).
  - Loads view engine via `src/config/viewEngine.js` (EJS templates in `views/`).
  - Imports and initializes route sets: `initRoutes`, `initUserRoutes`, `initProductsRoutes`, `initCategoriesRoutes`, `initOrdersRoutes`, `initCartRoutes`, `initUploadRoutes`, `initAuthenticated`, `initHomeRoutes`.
  - Registers a sample protected route using `authMiddleware`.

- `package.json`

  - Uses ES modules ("type": "module") and `node server.js` start script.
  - Important deps: `express`, `sequelize`, `mysql2`, `jsonwebtoken`, `bcrypt`, `cloudinary`, `multer`, `ejs`.

- `.env`

  - Contains sensitive config: `JWT_SECRET`, DB credentials (`DB_USER`, `DB_PASS`, `DB_NAME`), Cloudinary vars.
  - Example keys present in repo (update for production!).

- `src/config/config.cjs` and `src/models/index.js`

  - `config.cjs` reads `process.env` and provides Sequelize connection params per environment.
  - `models/index.js` dynamically imports all model files in `src/models/`, initializes Sequelize with `new Sequelize(...)`, registers associations via `model.associate(db)` if present, and exports the `db` object used across services.

- `src/models/*` (examples)

  - Each model exports a default function `(sequelize, DataTypes) => { return sequelize.define(...) }` and may define `.associate = (db) => { ... }` to register relationships.

- `src/service/*` (business logic)

  - Example: `productsService.js` uses `db.Products.findAll({ include: [...] })`, converts image buffer to base64 if present, validates input when creating, and returns structured responses (errorCode/message/products).

- `src/controllers/*`

  - Example: `productsController.js` receives request params, calls service, and returns status codes + JSON. Controllers focus on HTTP semantics.

- `src/middlewares/auth.js`

  - Extracts token from `req.cookies.token`, `req.session.token`, or `Authorization` header (`Bearer <token>`).
  - Verifies with `jwt.verify(token, process.env.JWT_SECRET)` and attaches `req.user = decoded`.
  - If missing/invalid token, renders `homeapi` EJS or returns JSON error.

- `src/cloudinaryConfig.js` and `src/upload.js`
  - `cloudinaryConfig.js` configures Cloudinary client using `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
  - `upload.js` integrates `multer` and `multer-storage-cloudinary` to accept file uploads and store images on Cloudinary (used by upload routes).

**Database & Models (relationships)**

- Sequelize config uses `config.cjs` values pulled from environment.
- `models/index.js` initializes all models dynamically and executes `associate` to wire associations.
- From code inspection (`productsService.js` and models used):
  - `Products` includes associations: `Categories` (as `categories`) and `Users` (as `users`).
  - There are models for `users`, `categories`, `products`, `orders`, `order_items`, `carts`, `cart_items`, `payment`.
  - Migrations present in `src/migrations/` indicate schema definitions (timestamped files).

ASCII relationship example (partial)

Users ---< Products >--- Categories
| |
| v
v OrderItems
Orders ---< OrderItems

This indicates typical e-commerce relationships:

- A `User` can create many `Products` (owner/creator).
- `Product` belongs to a `Category`.
- `Orders` contain `OrderItems` referencing `Products`.

**Routes, Controllers, Services mapping (table)**

| Route file                 | Controller           | Service                | Purpose                                         |
| -------------------------- | -------------------- | ---------------------- | ----------------------------------------------- |
| `routes/productsRoutes.js` | `productsController` | `productsService`      | CRUD for products, search, include associations |
| `routes/usersRoutes.js`    | `usersController`    | `usersServices`        | User registration, login, profile management    |
| `routes/ordersRoutes.js`   | `ordersController`   | `ordersService`        | Order creation and management                   |
| `routes/cartsRoutes.js`    | `cartsController`    | `cartsService`         | Cart and cart-item operations                   |
| `routes/uploadRoute.js`    | upload controller    | Cloudinary integration | Upload images/files to Cloudinary               |

Controller => Service => DB is the standard pattern across modules.

**Auth & Roles**

- JWT is used for authentication; `JWT_SECRET` from `.env`.
- `auth.js` middleware verifies the token and adds `req.user`.
- There's an `authrole.js` middleware file (not expanded here) that likely checks `req.user.role` against role constants found in `.env` (`ADMIN=1`, `MANAGER=2`, `USER=3`).

**View Engine**

- `views/` contains EJS templates (e.g., `products.ejs`, `login.ejs`) used by some routes to render HTML.
- `config/viewEngine.js` wires `app.set('view engine', 'ejs')` and `app.set('views', path)` (see file for exact behavior).

**Configuration and Environment**

- Important `.env` keys used by the project:
  - `PORT` (default 8080)
  - `JWT_SECRET`
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (or `CLOUDINARY_URL`)

**Run / Develop**

1. Create `.env` with the correct credentials (do not commit secrets).
2. Install dependencies:

```
npm install
```

3. Start the app in development:

```
node server.js
```

Or use `nodemon` if installed:

```
nodemon server.js
```

Notes:

- `server.js` only calls `app.listen()` when `process.env.NODE_ENV !== 'production'`. In production you may mount this app into another process or start differently.
- CORS is configured to allow `http://localhost:3000` — update as needed for your frontend origin.

**Diagnostics & Common issues**

- Database connection: ensure `DB_*` credentials match `config.cjs` and your MySQL instance is accessible.
- Sequelize dynamic import errors: `models/index.js` imports all `.js` files in `src/models/`; ensure model files export a default factory function with `model.name` set correctly.
- JWT errors: check `JWT_SECRET` and token extraction points: cookie, session, or `Authorization` header.
- Cloudinary: verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env`.

**Migrations & Seeds**

- Sequelize migration scripts live in `src/migrations/` and can be executed via `sequelize-cli` (installed as dev dependency). Example commands (adjust to your setup):

```
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**Appendix: Quick diagrams**

- Request path (detailed):

  Client HTTP Request
  |
  v
  Express Router (`routes/*.js`) -> route middleware -> controller
  |
  v
  Controller -> calls Service
  |
  v
  Service -> uses `db` (Sequelize models) to query/update DB
  |
  v
  DB (MySQL) <-> Sequelize

- Upload path:

  Client (file form) -> `uploadRoute` -> multer middleware -> store to Cloudinary via `upload.js` -> return Cloudinary URL

**Next steps / Recommendations**

- Move secrets to a secure vault for production (do not store API keys in repo).
- Add unit/integration tests for services and controllers.
- Add Dockerfile / docker-compose for local DB and app to simplify setup.
- Standardize error responses across controllers (consistent shape: `{ errorCode, message, data }`).

---

Generated: `document.md` — feel free to ask for deeper dives (model fields, per-route docs, or an OpenAPI spec extraction).
