import express from "express";
let router = express.Router();
let initPaymentsRoutes = (app) => {
  router.get("/payment/config", (req, res) => {
    return res.status(200).json({
      status: "success",
      data: process.env.CLIENT_ID,
    });
  });
  return app.use("/", router);
};
export default initPaymentsRoutes;
