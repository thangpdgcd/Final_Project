import { buildStaffRouter } from "./staff.build.js";
import { buildUserRouter } from "./user.build.js";

const initUserRoutes = (app) => {
  app.use("/api", buildStaffRouter());
  app.use("/api", buildUserRouter());
};

export default initUserRoutes;
