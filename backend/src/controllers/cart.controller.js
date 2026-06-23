const prisma = require('../config/prisma');

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if(!productId){
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            })
        }

        if(!quantity || quantity <= 0){
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            })
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        })

        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }
        if(quantity > product.stock){
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            })
        }

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

            const updatedCartItem = await prisma.cartItem.
            
            update({
                where: {
                    id: exitsingCartItem.id
                },
                data: {
                    quantity: exitsingCartItem.quantity + quantity
                }
            })
            return res.json({
                success: true,
                cartItem: updatedCartItem,
                message: "Cart item updated"
            });
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
            message: "Product added to cart",
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

        if(!cart){
            return res.status(200).json({
                success: true,
                cart: [],
                total : 0
            })
        }

        const total = cart.items.reduce((sum, item) => {
            return sum + item.quantity * item.product.price;
        }, 0);

        res.status(200).json({
            success: true,
            cart,
            total
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


const updateCartItemQuantity = async (req, res) =>{
    try {

        const productId = Number(req.params.productId);
        const { quantity } = req.body;

        if(!quantity || quantity <= 0){
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            })
        }

        const cart = await prisma.cart.findUnique({
            where: {
                userId: req.user.id,
            }
        })

        if(!cart){
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId
            },
            include: {
                product: true
            }
        })

        if(!cartItem){
            return res.status(404).json({
                success: false,
                message: " Item not found in cart"
            })
        }

        if(quantity > cartItem.product.stock){
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            })
        }

        const updatedCartItem = await prisma.cartItem.update({
            where: {
                id: cartItem.id
            },
            data: {
                quantity
            }
        })

        res.json({
            success: true,
            message: "Cart item quantity updated",
            cartItem: updatedCartItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


const removeFromCart = async (req, res) =>{
    try {

        const productId = Number(req.params.productId);

        const cart = await prisma.cart.findUnique({
            where: {    
                userId: req.user.id
            }
        })

        if(!cart){
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        const deleted = await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                productId
            }
        })

        if(deleted.count === 0){
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            })
        }

        res.status(200).json({
            success: true,
            message: "Product removed from cart"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


const clearCart = async (req, res) =>{
    try {

        const cart = await prisma.cart.findUnique({
            where: {    
                userId: req.user.id
            }
        })

        if(!cart){
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id
            }
        })

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


module.exports = { addToCart, getCart, removeFromCart, clearCart, updateCartItemQuantity };