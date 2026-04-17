/**
 * Admin domain surface: staff user management lives in `modules/staff`.
 * Import `buildStaffRouter` for HTTP registration (mounted under `/api` in `routes/usersRoutes.js`).
 */
export { buildStaffRouter } from "../staff/staff.routes.js";
