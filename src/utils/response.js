export const sendSuccess = (res, status, data, message = "OK") => {
  return res.status(status).json({ success: true, message, data });
};

export const sendError = (res, status, message, data = null) => {
  return res.status(status).json({ success: false, message, data });
};
