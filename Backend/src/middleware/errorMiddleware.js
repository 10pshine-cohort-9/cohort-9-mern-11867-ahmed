import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );
  if (err.stack) {
    logger.error(err.stack);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(err.status || statusCode);

  res.json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
