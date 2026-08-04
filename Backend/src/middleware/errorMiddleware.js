import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
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
