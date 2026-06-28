const prisma = require('../config/prisma');

const bcrypt = require('bcrypt');

const getDashboardOverview = async (req, res) => {
    try {
        const revenueStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

        const totalUsers = await prisma.user.count();
        const totalProducts = await prisma.product.count();
        const totalOrders = await prisma.order.count();
        const totalRevenue = await prisma.order.aggregate({ _sum: { 
            totalAmount: true 
            },
            where: {
                status: {
                    in: revenueStatuses,
                },
            },
        });

        const pendingOrders = await prisma.order.count({
            where: {
                status: 'PENDING'
            }
        })

        const deliveredOrders = await prisma.order.count({
            where: {
                status: 'DELIVERED'
            }
        })

        const cancelledOrders = await prisma.order.count({
            where: {
                status: 'CANCELLED'
            }
        })

        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);


        const todaysOrders = await prisma.order.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        })

        const todaysRevenue = await prisma.order.aggregate({
            _sum: {
                totalAmount: true
            },
            where: {
                status: {
                    in: revenueStatuses,
                },
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        })

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const monthRevenue = await prisma.order.aggregate({
            _sum: {
                totalAmount: true
            },
            where: {
                status: {
                    in: revenueStatuses,
                },
                createdAt: {
                    gte: startOfMonth,
                }
            }
        })

        const recentOrders = await prisma.order.findMany({
            orderBy: {
                createdAt: 'desc'
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
            }
        });

        const lowStockProducts = await prisma.product.count({
            where: {
                stock: {
                    gt: 0,
                    lt: 10,
                }
            },
        })

        const outofStockProducts = await prisma.product.count({
            where: {
                stock: 0
            }
        })

        return res.status(200).json({
            success: true,
            message: "Dashboard overview fetched successfully",
            data: {
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
            },
            recentOrders,
            lowStockProducts,
            outofStockProducts
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }
}

const getAllCustomers = async (req, res) => {
    try {

        const cutomers = await prisma.user.findMany({
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
            }
        })

        const result = cutomers.map(customer => {
            const totalSpending = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
            return {
                ...customer,
                totalSpending,
            };
        })
        return res.status(200).json({
            success: true,
            message: "All customers fetched successfully",
            data: result
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }
}


const getCustomerById = async (req, res) => {
    try {

        const userId = Number(req.params.id);

        const cutomer = await prisma.user.findUnique({
            where: {
                id: userId,
                isDeleted: false,
            },
            include: {
                orders: true,
                addresses: true,
            }
        })

        if(!cutomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            })
        }
        const totalSpending = cutomer.orders.reduce((sum, order) => sum + order.totalAmount, 0);

        const result = {
            
        };
        return res.status(200).json({
            success: true,
            message: "Customer fetched successfully",
            data: {
                ...cutomer,
            totalSpending,
            }
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }
}

const blockUser = async (req, res) => {
    try {

        const userId = Number(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            data: {
                isBlocked: true,
            },
        })

        return res.status(200).json({
            success: true,
            message: "User blocked successfully",
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : error.message || " Internal server error"
        })
    }

}
    

const unBlockUser = async (req, res) => {
    try {

        const userId = Number(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            data: {
                isBlocked: false,
            },
        })

        return res.status(200).json({
            success: true,
            message: "User unblocked successfully",
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : error.message || " Internal server error"
        })
    }

}

const deleteUser = async (req, res) => {
    try {

        const userId = Number(req.params.id);

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isDeleted: true,
            },
        })
        
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user,
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message : error.message || " Internal server error"
        })
    }
}

const resetUserPassword = async (req, res) => {
    try {

        const userId = Number(req.params.id);

        const { newPassword } = req.body;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        })

        return res.status(200).json({
            success: true,
            message: "User password reset successfully",
            data: user,
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message : error.message || " Internal server error"
        })
    }
}
    
module.exports = { getDashboardOverview, getAllCustomers, getCustomerById, blockUser, unBlockUser, deleteUser, resetUserPassword };