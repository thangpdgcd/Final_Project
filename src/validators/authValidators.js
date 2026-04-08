import { body } from "express-validator";

export const registerRules = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("address").optional().trim().isString(),
  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^[0-9+]{9,15}$/)
    .withMessage("Invalid phone number"),
  body("roleID").optional().trim().isIn(["1", "2", "3"]),
];

export const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];
