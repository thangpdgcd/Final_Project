import { buildStaffRouter } from "../modules/admin/index.js";
import { buildUserRouter } from "../modules/user/user.routes.js";

const initUserRoutes = (app) => {
  app.use("/api", buildStaffRouter());
  app.use("/api", buildUserRouter());
};

export default initUserRoutes;
