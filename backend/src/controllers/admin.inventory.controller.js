const prisma = require("../prismaClient");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getLowStockProducts = asyncHandler(async (req, res) => {
    try {

        const products = await prisma.product.findMany({
            where: {
                stock: { gt: 0, lt: 5 },
                isDeleted: false,
            },
            orderBy: {
                stock: "asc",
            },
        });

        return res.status(200).json(
            new ApiResponse(200, "Analytics overview fetched successfully", 
            products

            ));

    } catch (error) {
        throw new ApiError(500, "Failed to fetch low stock products");
    }
})


const getOutOfStockProducts = asyncHandler(async (req, res) => {

    try {

        const products = await prisma.product.findMany({
            where: {
                stock: 0,
                isDeleted: false,
            },
        });

        return res.status(200).json(
            new ApiResponse(200, "Out of stock products fetched successfully", products)
        );

    } catch (error) {
        throw new ApiError(500, "Failed to fetch out of stock products");
    }
})

const restockProduct = asyncHandler(async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const { quantity } = req.body;

        if(!quantity || quantity <= 0) {
            throw new ApiError(400, "Quantity must be a positive number");
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        const updatedProduct = await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                stock: product.stock + quantity,
            },
        });

        return res.status(200).json(
            new ApiResponse(200, "Product restocked successfully",
            updatedProduct
        ));

    } catch (error) {
        throw new ApiError(500, "Failed to restock product");
    }
})

const updateStock = asyncHandler(async (req, res) => {

    const productId = Number(req.params.id);
    const { stock } = req.body;

    if(stock === undefined || stock < 0) {
        return res.status(400).json(new ApiResponse(400, "Stock must be a non-negative number"));
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        return res.status(404).json(new ApiResponse(404, "Product not found"));
    }

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { stock },
    });

    return res.status(200).json(new ApiResponse(200, "Stock updated successfully", updatedProduct));

})


module.exports = {
    getLowStockProducts,
    getOutOfStockProducts,
    restockProduct,
    updateStock
}