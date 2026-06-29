const prisma = require('../config/prisma');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const getAnalytics = asyncHandler(async (req, res) => {

    try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const last30Days = new Date();
        loast30Days.setDate(today.getDate() - 30);

        const totalUsers = await prisma.user.count({
            where: {
                isDeleted: false,
            }
        });

        const totalOrders = await prisma.order.count();

        const todayOrders = await prisma.order.count({
            where: {
                createdAt: { gte: startOfDay },
            }
        })

        const monthlyOrders = await prisma.order.count({
            where: {
                createdAt: { gte: startOfMonth },
            }
        });

        const totalRevenue = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { paymentStatus: 'PAID' }
        })

        const todayRevenue = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                createdAt: { gte: startOfDay },
                paymentStatus: 'PAID'
            }
        })

        const monthlyRevenue = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                createdAt: { gte: startOfMonth },
                paymentStatus: 'PAID'
            }
        })

        const dailySales = await prisma.order.groupBy({
            by: ['createdAt'],
            _sum: { totalAmount: true },
            where: {
                createdAt: { gte: last30Days },
                paymentStatus: 'PAID'
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: {
                _sum: { quantity: 'desc' }
            },
            take: 10,
        });

        const topProductsDetails = await Promise.all(topProducts.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });
            return { ...item, product };
        }));

        const topCustomers = await prisma.order.groupBy({
            by: ['userId'],
            _sum: { totalAmount: true },
            orderBy: {
                _sum: { totalAmount: 'desc' }
            },
            take: 10,
        });

        const topCustomersDetails = await Promise.all   (topCustomers.map(async (item) => {
                const user = await prisma.user.findUnique({
                    where: { id: item.userId },
                });
                return { ...item, user };
            }
        ));

        return  res.status(200).json(new ApiResponse(200, "Analytics overview fetched successfully", 
            data = {
                users : {
                    totalUsers,
                },
                orders: {
                    totalOrders,
                    todayOrders,
                    monthlyOrders,  
                },
                revenue: {

                    totalRevenue: totalRevenue._sum.totalAmount || 0,
                    todayRevenue: todayRevenue._sum.totalAmount || 0,
                    monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
                },
                dailySales,
                topProducts: topProductsDetails,
                topCustomers: topCustomersDetails,
        }));

    } catch (error) {
        throw new ApiError(500, "Failed to fetch analytics overview");
    }
})

module.exports = { getAnalytics };