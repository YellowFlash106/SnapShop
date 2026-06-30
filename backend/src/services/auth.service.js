const prisma = require("../config/prisma");

const createRefreshToken = async (data) => {
    return prisma.refreshToken.create({
        data,
    });
};


const findRefreshToken = async (token) => {
    return prisma.refreshToken.findUnique({
        where: {
            token,
        },
        include: {
            user: true,
        },
    });
};


const deleteRefreshToken = async (id) => {
    return prisma.refreshToken.delete({
        where: {
            id,
        }
    });
};


const deleteUserRefreshTokens = async (userId) => {
    return prisma.refreshToken.deleteMany({
        where: {
            userId,
        }
    });
};


module.exports = {
    createRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    deleteUserRefreshTokens,
};