const env = require("../config/env");

function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message =
    statusCode === 500 && env.isProduction
      ? "Internal server error"
      : err.message || "An unexpected error occurred";

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDevelopment && err.stack ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
