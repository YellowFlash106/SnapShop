const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");

const createRefreshToken = asyncHandler(async (data) => {
    return prisma.refreshToken.create({
        data,
    });
});


const findRefreshToken = asyncHandler(async (token) => {
    return prisma.refreshToken.findUnique({
        where: {
            token,
        },
        include: {
            user: true,
        },
    });
});


const deleteRefreshToken = asyncHandler(async (id) => {
    return prisma.refreshToken.delete({
        where: {
            id,
        }
    });
});


const deleteUserRefreshTokens = asyncHandler(async (userId) => {
    return prisma.refreshToken.deleteMany({
        where: {
            userId,
        }
    });
});


module.exports = {
    createRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    deleteUserRefreshTokens,
};