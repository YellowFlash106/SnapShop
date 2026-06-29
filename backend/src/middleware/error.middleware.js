const ApiError = require("../utils/ApiError");

const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const error = err instanceof ApiError
        ? err
        : new ApiError(
            err.statusCode || 500,
            err.message || "Something went wrong",
            err.errors || [],
            err.stack || ""
        );

    return res.status(error.statusCode).json({
        success: error.success,
        message: error.message,
        errors: error.errors,
    });
};

module.exports = errorMiddleware;