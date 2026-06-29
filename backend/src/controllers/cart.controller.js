const prisma = require('../config/prisma');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    if (!quantity || quantity <= 0) {
        throw new ApiError(400, "Quantity must be greater than 0");
    }

    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (quantity > product.stock) {
        throw new ApiError(400, "Insufficient stock");
    }

    let cart = await prisma.cart.findUnique({
        where: {
            userId: req.user.id,
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId: req.user.id,
            },
        });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId,
        },
    });

    if (existingCartItem) {
        const updatedCartItem = await prisma.cartItem.update({
            where: {
                id: existingCartItem.id,
            },
            data: {
                quantity: existingCartItem.quantity + quantity,
            },
        });

        return res.status(200).json(
            new ApiResponse(200, "Cart item updated", updatedCartItem)
        );
    }

    const cartItem = await prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            quantity,
        },
    });

    return res.status(201).json(
        new ApiResponse(201, "Product added to cart", cartItem)
    );
});


const getCart = asyncHandler(async (req, res) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId: req.user.id,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!cart) {
        return res.status(200).json(
            new ApiResponse(200, "Cart fetched successfully", {
                cart: [],
                total: 0,
            })
        );
    }

    const total = cart.items.reduce((sum, item) => {
        return sum + item.quantity * item.product.price;
    }, 0);

    return res.status(200).json(
        new ApiResponse(200, "Cart fetched successfully", {
            cart,
            total,
        })
    );
});


const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const productId = Number(req.params.productId);
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        throw new ApiError(400, "Quantity must be greater than 0");
    }

    const cart = await prisma.cart.findUnique({
        where: {
            userId: req.user.id,
        },
    });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId,
        },
        include: {
            product: true,
        },
    });

    if (!cartItem) {
        throw new ApiError(404, "Item not found in cart");
    }

    if (quantity > cartItem.product.stock) {
        throw new ApiError(400, "Insufficient stock");
    }

    const updatedCartItem = await prisma.cartItem.update({
        where: {
            id: cartItem.id,
        },
        data: {
            quantity,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Cart item quantity updated", updatedCartItem)
    );
});


const removeFromCart = asyncHandler(async (req, res) => {
    const productId = Number(req.params.productId);

    const cart = await prisma.cart.findUnique({
        where: {
            userId: req.user.id,
        },
    });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const deleted = await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
            productId,
        },
    });

    if (deleted.count === 0) {
        throw new ApiError(404, "Item not found in cart");
    }

    return res.status(200).json(
        new ApiResponse(200, "Product removed from cart")
    );
});


const clearCart = asyncHandler(async (req, res) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId: req.user.id,
        },
    });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Cart cleared successfully")
    );
});


module.exports = { addToCart, getCart, removeFromCart, clearCart, updateCartItemQuantity };