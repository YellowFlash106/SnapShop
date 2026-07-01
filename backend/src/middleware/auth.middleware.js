const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");


const authenticate = asyncHandler(async (req, res, next) => {

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")){
            throw new ApiError(401, "Authentication required");
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        if(!user) {
            throw new ApiError(401, "User not found");
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            permissions: user.role.rolePermissions.map(rp => rp.permission.name)
        };

        next();
        
    } catch (error) {
        throw new ApiError(401, "Invalid token");
    }
});

module.exports = authenticate;