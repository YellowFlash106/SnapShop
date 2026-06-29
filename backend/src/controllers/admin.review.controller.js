const prisma = require('../config/prisma');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");


const getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
        where: {
            isDeleted: false,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            product: {
                select: {
                    id: true,
                    name: true,
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


const approveReview = asyncHandler(async (req, res) => {
    const reviewId = Number(req.params.id);

    const review = await prisma.review.update({
        where: { id: reviewId },
        data: {
            isApproved: true,
            isHidden: false,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Review approved successfully", review)
    );
});


const hideReview = asyncHandler(async (req, res) => {
    const reviewId = Number(req.params.id);

    const review = await prisma.review.update({
        where: { id: reviewId },
        data: {
            isHidden: true,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Review hidden successfully", review)
    );
});


const deleteReview = asyncHandler(async (req, res) => {
    const reviewId = Number(req.params.id);

    const review = await prisma.review.update({
        where: { id: reviewId },
        data: {
            isDeleted: true,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, "Review deleted successfully", review)
    );
});

module.exports = { getAllReviews, approveReview, deleteReview, hideReview }