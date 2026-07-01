const prisma = require("../config/prisma");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await prisma.user.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                role: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const total = await prisma.user.count();

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
});


const getUserById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        rolePermissions: {
                            select: {
                                permission: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                createdAt: true
            }
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }
        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
});
 

const updateUserRole = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { roleId } = req.body;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                roleId: Number(roleId)
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return res.status(200).json(
            new ApiResponse(200, "User role updated successfully", updatedUser)
        );

    } catch (error) {
        next(error);
    }
});


const getMyProfile = asyncHandler(async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                role: {
                    select: {
                        name: true
                    }
                },
                createdAt: true
            }
        });

        return res.status(200).json(
            new ApiResponse(200, "User profile fetched successfully", user)
        );

    } catch (error) {
        next(error);
    }
});


module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    getMyProfile
};