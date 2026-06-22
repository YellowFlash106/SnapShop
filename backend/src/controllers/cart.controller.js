const prisma = require('../config/prisma');

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        let cart = await prisma.cart.findUnique({
            where:{
                userId: req.user.id
            }
        })

        if(!cart){
            cart = await prisma.cart.create({
                data: {
                    userId: req.user.id
                }
            })
        }

        const exitsingCartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId
            }
        })

        if(exitsingCartItem){
            const updatedCartItem = await prisma.cartItem.update({
                where: {
                    id: exitsingCartItem.id
                },
                data: {
                    quantity: exitsingCartItem.quantity + quantity
                }
            })
            return res.json(updatedCartItem);
        }

        const cartItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,

            }
        })

        res.status(201).json({
            success: true,
            cartItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


const getCart = async (req, res) =>{
    try {

        const cart = await prisma.cart.findUnique({
            where: {
                userId: req.user.id
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        res.json({
            success: true,
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = { addToCart, getCart }