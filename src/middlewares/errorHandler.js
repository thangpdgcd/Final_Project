import { AppError } from "../utils/AppError.js";
import { sendError } from "../utils/response.js";
import Sequelize from "sequelize";

const isProd = process.env.NODE_ENV === "production";

const sequelizeMessage = (err) => {
  if (err instanceof Sequelize.ValidationError) {
    return err.errors?.map((e) => e.message).join("; ") || "Validation error";
  }
  if (err instanceof Sequelize.UniqueConstraintError) {
    return "Duplicate entry violates a unique constraint";
  }
  if (err instanceof Sequelize.ForeignKeyConstraintError) {
    return "Referenced record does not exist";
  }
  return err.message || "Database error";
};

const statusFromSequelize = (err) => {
  if (err instanceof Sequelize.ValidationError) return 400;
  if (err instanceof Sequelize.UniqueConstraintError) return 409;
  if (err instanceof Sequelize.ForeignKeyConstraintError) return 400;
  return 500;
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.data);
  }

  const explicitStatus = Number(err.statusCode || err.status);
  if (Number.isFinite(explicitStatus) && explicitStatus >= 400 && explicitStatus < 600) {
    return sendError(res, explicitStatus, err.message || "Error", null);
  }

  if (err instanceof Sequelize.Error) {
    const status = statusFromSequelize(err);
    const message = sequelizeMessage(err);
    if (!isProd && status === 500) {
      console.error(err);
    }
    return sendError(res, status, message, null);
  }

  const status = Number(err.statusCode || err.status) || 500;
  const message =
    status === 500 && isProd ? "Internal server error" : err.message || "Internal server error";

  if (status >= 500) {
    console.error(err);
  }

  return sendError(res, status, message, null);
};
