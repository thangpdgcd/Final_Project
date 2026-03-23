import express from "express";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment & PayPal configuration APIs
 */

/**
 * @swagger
 * /payment/config:
 *   get:
 *     summary: Get PayPal client ID
 *     description: Return PayPal client ID for frontend integration
 *     tags: [Payments]
 *     security: []
 *     responses:
 *       200:
 *         description: PayPal client ID retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   example: AbCdEfGhIjKlMnOpQr
 *       500:
 *         description: Missing PayPal client ID in environment variables
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Missing PAYPAL_CLIENT_ID in .env
 */
const initPaymentsRoutes = (app) => {
  router.get("/payment/config", (req, res) => {
    const client_id = process.env.PAYPAL_CLIENT_ID;

    if (!client_id) {
      return res.status(500).json({
        status: "error",
        message: "Missing PAYPAL_CLIENT_ID in .env",
      });
    }

    res.set("Cache-Control", "no-store");
    return res.status(200).json({
      status: "success",
      data: client_id,
    });
  });

  return app.use("/", router);
};

export default initPaymentsRoutes;
