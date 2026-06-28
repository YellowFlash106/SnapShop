const prisma = require('../config/prisma');


const getAllReviews = async (req, res) => {

    try {

        const reviews = await prisma.review.findMany({
            where: {
                isDeleted: false
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
        })

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


const approveReview = async (req, res) => {

    try {

        const reviewId = req.params.id;

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { 
                isApproved: true,
                isHidden: false,
             },
        })

        return res.status(200).json({
            success: true,
            message: "Review approved successfully",
            data: review
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }

}


const hideReview = async (req, res) => {

    try {

        const reviewId = req.params.id;

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { 
                isHidden: true
             },
        })

        return res.status(200).json({
            success: true,
            message: "Review hidden successfully",
            data: review
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

        const reviewId = req.params.id;

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { 
                isDeleted: true
             },
        })

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            data: review
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message : " Internal server error"
        })
    }

}

module.exports = { getAllReviews, approveReview, deleteReview, hideReview }