const prisma = require('../config/prisma');

const createReview = async (req, res) => {
    try {
        
        const userId = Number(req.params.id);
        const productId = Number(req.params.productId);

        const { rating, comment } = req.body;

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                userId,
                productId,
                isDeleted: false
            }
        });

        if(existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product"
            })
        }

        const review = await prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                comment,
                isApproved : false,
            }
        })

        return res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: review
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }
}

const updateReview = async (req, res) => {
    try {
        
        const userId = req.user.id;
        const reviewId = Number(req.params.id);

        const { rating, comment } = req.body;

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if(!review || review.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            })
        }

        if(review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own review"
            })
        }

        const updatedReview = await prisma.review.update({
            where: {
                id: reviewId
            },
            data: {
                rating,
                comment,
                isApproved: false
            }
        })

        return res.status(201).json({
            success: true,
            message: "Review updated successfully",
            data: updatedReview
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }
}

const deleteReview = async (req, res) => {
    try {
        
        const userId = req.user.id;
        const reviewId = Number(req.params.id);

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if(!review || review.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            })
        }

        if(review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own review"
            })
        }

        const deletedReview = await prisma.review.update({
            where: {
                id: reviewId
            },
            data: {
                isDeleted: true
            }
        })

        return res.status(201).json({
            success: true,
            message: "Review deleted successfully",
            data: deletedReview
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }
}

const getProductReviews = async (req, res) => {
    try {

        const productId = Number(req.params.productId);

        const reviews = await prisma.review.findMany({
            where: {
                productId,
                isDeleted: false,
                isHidden: false,
                isApproved: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            oderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            data: reviews
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }
}


module.exports = { createReview, updateReview, deleteReview, getProductReviews }