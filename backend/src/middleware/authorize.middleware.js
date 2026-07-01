const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const authorize = asyncHandler((...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        const userPermissions = req.user.permissions;

        const hasPermission = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            throw new ApiError(403, "Forbidden: You do not have the required permissions");
        }

        next();
    };
});

module.exports = authorize;