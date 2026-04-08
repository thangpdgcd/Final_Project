import { sendError } from "../utils/response.js";

export const notFoundHandler = (req, res) => {
  if (req.path.startsWith("/api")) {
    return sendError(res, 404, "Not found", null);
  }
  return res.status(404).render("notfound");
};
