import { buildAuthRouter } from "../modules/auth/auth.routes.js";

const router = buildAuthRouter();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new account
 *     description: |
 *       Required: `name`, `email`, `password` (min 6 characters).
 *       Omit `roleID` to default to customer (`"1"`).
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 description: Optional; 9–15 digits (may include +)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               roleID:
 *                 type: string
 *                 enum: ["1", "2", "3"]
 *                 description: "1 = customer, 2 = admin, 3 = staff"
 *           example:
 *             name: "Test User"
 *             email: "swagger.test@example.com"
 *             password: "123456"
 *             address: "Example City"
 *             phoneNumber: "0901234567"
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleID:
 *                       type: string
 *             example:
 *               message: "Registration successful"
 *               user:
 *                 id: 10
 *                 name: "Test User"
 *                 email: "swagger.test@example.com"
 *                 roleID: "1"
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               missingFields:
 *                 summary: Missing fields
 *                 value: { success: false, message: "Validation failed", data: [] }
 *               duplicateEmail:
 *                 summary: Duplicate email
 *                 value: { success: false, message: "Email already exists.", data: null }
 */
// routes are provided by buildAuthRouter()

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login and receive JWT access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (paste into Swagger Authorize)
 *                 user:
 *                   type: object
 */
// routes are provided by buildAuthRouter()

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current logged-in user info
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Unauthorized
 */
// routes are provided by buildAuthRouter()

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout (clears refresh token cookie)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Logout success
 */
// routes are provided by buildAuthRouter()

/**
 * Refresh token: expects refresh_token in HTTP-only cookie
 */
// routes are provided by buildAuthRouter()

const initAuthenticated = (app) => {
  app.use("/api", router);
};

export default initAuthenticated;
