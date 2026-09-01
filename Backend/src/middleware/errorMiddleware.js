import logger from "../utils/logger.js";

const sanitizeLogValue = (value) =>
  typeof value === "string" ? value.replace(/[\r\n]/g, "_") : value;

const errorHandler = (err, req, res, next) => {
  const safeUrl = sanitizeLogValue(req.originalUrl);
  const safeIp = sanitizeLogValue(req.ip);
  const safeMessage = sanitizeLogValue(err.message);
  logger.error(
    `${err.status || 500} - ${safeMessage} - ${safeUrl} - ${req.method} - ${safeIp}`,
  );
  if (err.stack) {
    logger.error(err.stack);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const finalStatus = err.status || statusCode;
  res.status(finalStatus);

  res.json({
    message: finalStatus >= 500 ? "Internal Server Error" : (err.message || "An error occurred"),
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
