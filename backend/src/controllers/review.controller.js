const prisma = require('../config/prisma');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");    

const createReview = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    const productId = Number(req.params.productId);

    const { rating, comment } = req.body;

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            userId,
            productId,
            isDeleted: false,
        },
    });

    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this product");
    }

    const review = await prisma.review.create({
        data: {
            userId,
            productId,
            rating,
            comment,
            isApproved: false,
        },
    });

    return res.status(201).json(
        new ApiResponse(201, "Review created successfully", review)
    );
});

const updateReview = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const reviewId = Number(req.params.id);

    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review || review.isDeleted) {
        throw new ApiError(404, "Review not found");
    }

    if (review.userId !== userId) {
        throw new ApiError(403, "You can only update your own review");
    }

    const updatedReview = await prisma.review.update({
        where: {
            id: reviewId,
        },
        data: {
            rating,
            comment,
            isApproved: false,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Review updated successfully", updatedReview)
    );
});

const deleteReview = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const reviewId = Number(req.params.id);

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review || review.isDeleted) {
        throw new ApiError(404, "Review not found");
    }

    if (review.userId !== userId) {
        throw new ApiError(403, "You can only delete your own review");
    }

    const deletedReview = await prisma.review.update({
        where: {
            id: reviewId,
        },
        data: {
            isDeleted: true,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Review deleted successfully", deletedReview)
    );
});

const getProductReviews = asyncHandler(async (req, res) => {
    const productId = Number(req.params.productId);

    const reviews = await prisma.review.findMany({
        where: {
            productId,
            isDeleted: false,
            isHidden: false,
            isApproved: true,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Reviews fetched successfully", reviews)
    );
});


module.exports = { createReview, updateReview, deleteReview, getProductReviews }