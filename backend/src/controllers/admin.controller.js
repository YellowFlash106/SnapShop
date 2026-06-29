const prisma = require('../config/prisma');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const bcrypt = require('bcrypt');

const getDashboardOverview = asyncHandler(async (req, res) => {
    const revenueStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: {
            totalAmount: true,
        },
        where: {
            status: {
                in: revenueStatuses,
            },
        },
    });

    const pendingOrders = await prisma.order.count({
        where: {
            status: 'PENDING',
        },
    });

    const deliveredOrders = await prisma.order.count({
        where: {
            status: 'DELIVERED',
        },
    });

    const cancelledOrders = await prisma.order.count({
        where: {
            status: 'CANCELLED',
        },
    });

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todaysOrders = await prisma.order.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const todaysRevenue = await prisma.order.aggregate({
        _sum: {
            totalAmount: true,
        },
        where: {
            status: {
                in: revenueStatuses,
            },
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthRevenue = await prisma.order.aggregate({
        _sum: {
            totalAmount: true,
        },
        where: {
            status: {
                in: revenueStatuses,
            },
            createdAt: {
                gte: startOfMonth,
            },
        },
    });

    const recentOrders = await prisma.order.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 10,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            },
        },
    });

    const lowStockProducts = await prisma.product.count({
        where: {
            stock: {
                gt: 0,
                lt: 10,
            },
        },
    });

    const outofStockProducts = await prisma.product.count({
        where: {
            stock: 0,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'Dashboard overview fetched successfully', {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            todaysOrders,
            todaysRevenue: todaysRevenue._sum.totalAmount || 0,
            monthRevenue: monthRevenue._sum.totalAmount || 0,
            recentOrders,
            lowStockProducts,
            outofStockProducts,
        })
    );
});

const getAllCustomers = asyncHandler(async (req, res) => {
    const customers = await prisma.user.findMany({
        where: {
            isDeleted: false,
        },
        include: {
            orders: {
                select: {
                    id: true,
                    totalAmount: true,
                    status: true,
                },
            },
            addresses: true,
        },
    });

    const result = customers.map((customer) => {
        const totalSpending = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        return {
            ...customer,
            totalSpending,
        };
    });

    return res.status(200).json(
        new ApiResponse(200, 'All customers fetched successfully', result)
    );
});


const getCustomerById = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    const customer = await prisma.user.findFirst({
        where: {
            id: userId,
            isDeleted: false,
        },
        include: {
            orders: true,
            addresses: true,
        },
    });

    if (!customer) {
        throw new ApiError(404, 'Customer not found');
    }

    const totalSpending = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return res.status(200).json(
        new ApiResponse(200, 'Customer fetched successfully', {
            ...customer,
            totalSpending,
        })
    );
});

const blockUser = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            isBlocked: true,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'User blocked successfully', user)
    );
});
    

const unBlockUser = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            isBlocked: false,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'User unblocked successfully', user)
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            isDeleted: true,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'User deleted successfully', user)
    );
});

const resetUserPassword = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'User password reset successfully', user)
    );
});
    
module.exports = { getDashboardOverview, getAllCustomers, getCustomerById, blockUser, unBlockUser, deleteUser, resetUserPassword };