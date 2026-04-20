export { authenticate, authenticate as verifyToken } from "./authenticate.js";
export {
  checkRole,
  isAdmin,
  isStaff,
  isStaffOrAdmin,
  isCustomer,
} from "./authorize.js";
