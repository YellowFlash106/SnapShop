const prisma = require('../config/prisma');
const { generateInvoice } = require('../services/invoice.service');


const createOrder  = async (req, res) => {

    try{
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    },
                },
            },
        });

        if(!cart || cart.items.length === 0){
            return res.status(404).json({
                success: false,
                message: 'Cart is empty'
            })
        }

        let totalAmount = 0;

        for(const item of cart.items){
            if(item.quantity > item.product.stock){
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for product ${item.product.name}`
                })
            }

            totalAmount += item.quantity * item.product.price;
        }

        const order = await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            
            for(const item of cart.items){
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });
                
                if(!product){
                    throw new Error(`Product ${item.product.name} not found`);
                }
                
                const availableStock = product.stock - product.reservedStock;
                if(item.quantity > availableStock){
                    throw new Error(`Not enough available stock for product ${item.product.name}`);
                }
                
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        reservedStock: {
                            increment: item.quantity,
                        },
                    },
                });

                totalAmount += item.quantity * product.price;
            }

            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    status: 'PENDING'
                },
            });

            for(const item of cart.items){
                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    },
                });

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        reservedStock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return newOrder;
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


const getUserOrders = async (req, res) => {

    try{
        const userId = req.user.id;
        
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            orders,
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


const getOrderById = async (req, res) => {

    try{
        const userId = req.user.id;
        const orderId = Number(req.params.id);
        
        const order = await prisma.order.findFirst({
            where: { userId, id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
        });

            if(!order){
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                })
            }

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


const cancelOrder = async (req, res) => {

    try{
        const userId = req.user.id;
        const orderId = Number(req.params.id);
        
        const order = await prisma.order.findFirst({
            where: { userId, id: orderId },
            include: {
                items: true, 
            }
        });

        if(!order){
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }
        if(order.status !== 'PENDING'){
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be cancelled'
            })
        }

        const updated = await prisma.order.$transaction(async (tx) => {

            for(const item of order.items){
                await tx.product.update({
                    where: { id: item.productId },
                    data: { 
                        stock: {
                            decrement: quantity,
                        },
                        reservedStock: {
                            decrement: item.quantity
                        },
                    },
                });
            }
        })

        return tx.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: updated,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


const updateOrderStatus = async (req, res) => {

    try{
        const orderId = Number(req.params.id);

        const { status } = req.body;
        
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if(!order){
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }
        
        const updatedOrder = await prisma.$transaction(async (tx) => {

            const updated = await tx.order.update({
                where: { id: orderId },
                data: { status },
            })

            await tx.orderHistory.create({
                data: { 
                    orderId,
                    status,
                },
            });
            return updated;
        })

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order: updatedOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


const getOrderHistory = async (req, res) => {
    try {

    const orderId = Number(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { 
            id: true,
            userId: true,
        },
    });

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }

    const history = await prisma.orderHistory.findMany({
        where: { orderId },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return res.status(200).json({
        success: true,
        message: 'Order history fetched successfully',
        history,
    });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


const getOrderTracking = async (req, res) => {
    try {

    const orderId = Number(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }

    if(order.userId !==  req.user.id){
        return res.status(403).json({
            success: false,
            message: "You are not authorized to view this order's tracking information",
        });
    }

    const history = await prisma.orderHistory.findMany({
        where: { orderId },
        orderBy: {
            createdAt: 'asc'
        }
    });

    return res.status(200).json({
        success: true,
        message: 'Order tracking information fetched successfully',
        orderId,
        status: order.status,
        timeline: history,

    });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


const reorder = async (req, res) => {
    try {

    const orderId = Number(req.params.id);
    const userId = req.user.id;

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    if (!order || order.userId !== userId) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }

    const cart = await prisma.cart.findUnique({
        where: { userId },
    });

    for(const item of order.items){
        await prisma.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: item.productId
                }
            },
            update: {
                quantity: { increment: item.quantity }
            },
            create: {
                cartId: cart.id,
                productId: item.productId,
                quantity: item.quantity
            }
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Order items added to cart successfully',
    });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


const getorderSummary = async (req, res) => {
    try {

    const orderId = Number(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    if (!order || order.userId !== req.user.id) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }

    const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

    return res.status(200).json({
        success: true,
        message: 'Order summary retrieved successfully',
        orderId,
        totalItems,
        totalAmount: order.totalAmount,
        status: order.status,
    });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getInvoice = async (req, res) => {
    try{

        const orderId = Number(req.params.id);
        const userId = req.user.id;

        await generateInvoice(orderId, res, userId);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message:  error.message || 'Internal server error'
        });
    }
}


module.exports = { createOrder , getUserOrders, getOrderById, cancelOrder, updateOrderStatus, getOrderHistory, getOrderTracking, getorderSummary, generateInvoice, reorder };