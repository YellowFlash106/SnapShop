
const prisma = require('../config/prisma');

const createProduct = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    try{
        const { name, description, price, stock } = req.body;

        const product = await prisma.product.create({
            data:{
                name,
                description,
                price : Number(price),
                stock : Number(stock),
                createdById : req.user.id
            }
        })
        if (req.user.role !== "admin") {
    return res.status(403).json({
        message: "Access denied"
    });
}
        res.status(201).json({
            success : true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


const getAllProducts = async (req, res) =>{
    try {
        const products = await prisma.product.findMany({
            include : {
                createdBy : {
                    select : {
                        id : true,
                        name : true,
                        email : true
                    }
                }
            }
        })
        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


const getProduct = async (req, res) =>{
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
        return res.status(400).json({
            success: false,
            message: "Product id must be a number"
        });
    }

    try {
        const product = await prisma.product.findUnique({
            where : {
                id : productId
            }
        })
        if(!product){
            return res.status(404).json({
                success: false,
                message : "Product not found"
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


const updateProduct = async (req, res) =>{
    if (req.user.role !== "admin") {
    return res.status(403).json({
        message: "Access denied"
    });
}
    const { id } = req.params;
    const product = await prisma.product.update({
        where : {
            id : Number(id)
        },
        data : req.body
    })
    res.json(product);
}


const deleteProduct = async (req, res) =>{
    if (req.user.role !== "admin") {
    return res.status(403).json({
        message: "Access denied"
    });
}
    const { id } = req.params;
    const product = await prisma.product.delete({
        where : {
            id : Number(id)
        }
    })
    res.json({
        message : "Product deleted successfully",
    });
}


module.exports = { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct };

