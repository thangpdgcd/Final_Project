import express from "express";

const router = express.Router();

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
