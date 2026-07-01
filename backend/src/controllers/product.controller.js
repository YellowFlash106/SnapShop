const prisma = require('../config/prisma');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");


const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, stock } = req.body;

    if (!name || !description || !price || !stock) {
        throw new ApiError(400, "All fields are required");
    }

    if (Number(price) <= 0 || Number(stock) < 0) {
        throw new ApiError(400, "Price must be greater than 0 and stock cannot be negative");
    }

    const product = await prisma.product.create({
        data: {
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            createdById: req.user.id,
        },
    });

    return res.status(201).json(
        new ApiResponse(201, "Product created successfully", product)
    );
});


const getAllProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const { category, minPrice, maxPrice } = req.query;

    const where = {};

    if (category) {
        where.category = {
            name: {
                equals: category,
                mode: "insensitive",
            },
        };
    }

    if (minPrice || maxPrice) {
        where.price = {};

        if (minPrice) {
            where.price.gte = Number(minPrice);
        }

        if (maxPrice) {
            where.price.lte = Number(maxPrice);
        }
    }

    const products = await prisma.product.findMany({
        where: {
            ...where,
            name: {
                contains: search,
                mode: "insensitive",
            },
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
    });

    const totalProducts = await prisma.product.count({
        where: {
            ...where,
            name: {
                contains: search,
                mode: "insensitive",
            },
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Products fetched successfully", {
            products,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
        })
    );
});


const getProduct = asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
        throw new ApiError(400, "Product id must be a number");
    }

    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Product fetched successfully", product)
    );
});


const searchProducts = asyncHandler(async (req, res) => {
    const { search } = req.query;

    const where = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where,
    });

    return res.status(200).json(
        new ApiResponse(200, "Products fetched successfully", products)
    );
});


const updateProduct = asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);

    const existingProduct = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });

    if (!existingProduct) {
        throw new ApiError(404, "Product not found");
    }

    const { name, description, price, stock } = req.body;

    const updatedProduct = await prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            ...(name && { name }),
            ...(description && { description }),
            ...(price && { price: Number(price) }),
            ...(stock && { stock: Number(stock) }),
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Product updated successfully", updatedProduct)
    );
});


const deleteProduct = asyncHandler(async (req, res) => {
    const productId = Number(req.params.id);

    const existingProduct = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });

    if (!existingProduct) {
        throw new ApiError(404, "Product not found");
    }

    await prisma.product.delete({
        where: {
            id: productId,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Product deleted successfully")
    );
});


const productOwnership = asyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const productId = req.params.id;

        const product = await prisma.product.findUnique({
            where: {
                id: Number(productId)
            }
        });

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

         if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
            req.product = product;
            return next();
        }

        if (product.createdById !== user.id) {
            throw new ApiError(403, "You are not allowed to modify this product");
        }

        req.product = product;
        next();

    } catch (error) {
        next(error);
    }
});


const addReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const parsedProductId = Number(productId);

    if (!Number.isInteger(parsedProductId)) {
        throw new ApiError(400, "Product id must be a number");
    }

    const product = await prisma.product.findUnique({
        where: { id: parsedProductId },
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const review = await prisma.review.create({
        data: {
            rating: Number(rating),
            comment,
            productId: parsedProductId,
            userId: req.user.id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return res.status(201).json(
        new ApiResponse(201, "Review added successfully", review)
    );
});


const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
        where: { productId: Number(productId) },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Reviews fetched successfully", reviews)
    );
});


const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const parsedProductId = Number(productId);

    if (!Number.isInteger(parsedProductId)) {
        throw new ApiError(400, "Product id must be a number");
    }

    const product = await prisma.product.findUnique({
        where: { id: parsedProductId },
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const item = await prisma.wishlist.create({
        data: {
            userId: req.user.id,
            productId: parsedProductId,
        },
    });

    return res.status(201).json(
        new ApiResponse(201, "Item added to wishlist successfully", item)
    );
});


const getWishlist = asyncHandler(async (req, res) => {
    const items = await prisma.wishlist.findMany({
        where: { userId: req.user.id },
        include: {
            product: true,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Wishlist fetched successfully", items)
    );
});


const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const parsedProductId = Number(productId);

    if (!Number.isInteger(parsedProductId)) {
        throw new ApiError(400, "Product id must be a number");
    }

    await prisma.wishlist.deleteMany({
        where: {
            userId: req.user.id,
            productId: parsedProductId,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Item removed from wishlist successfully")
    );
});


module.exports = { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct , searchProducts, addReview, getProductReviews, addToWishlist, getWishlist, removeFromWishlist, productOwnership };

