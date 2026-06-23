
const prisma = require('../config/prisma');


const createProduct = async (req, res) => {
    try{
        const { name, description, price, stock } = req.body;

        if(!name || !description || !price || !stock){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        
        if(Number(price) <= 0 || Number(stock) < 0){
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0 and stock cannot be negative"
            });
        }
        

        const product = await prisma.product.create({
            data:{
                name,
                description,
                price : Number(price),
                stock : Number(stock),
                createdById : req.user.id
            }
        })
       
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";


        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive"
                }
            },
            include : {
                createdBy : {
                    select : {
                        id : true,
                        name : true,
                        email : true
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                createdAt: "desc"
            }
        })

        const totalProducts = await prisma.product.count({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive"
                }
            }
        })

        res.status(200).json({
            success: true,
            products,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit)
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


const getProduct = async (req, res) =>{
    try {

    const productId = Number(req.params.id);

        if (!Number.isInteger(productId)) {
            return res.status(400).json({
                success: false,
                message: "Product id must be a number"
            });
        }

        const product = await prisma.product.findUnique({
            where : {
                id : productId
            },
            include : {
                createdBy : {
                    select: {
                        id : true,
                        name : true,
                        email : true
                    },
                },
            },
        })
        if(!product){
            return res.status(404).json({
                success: false,
                message : "Product not found"
            });
        }

        res.status(200).json({
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
    try{

        const productId = Number(req.params.id);

        const existingProduct = await prisma.product.findUnique({
            where: {
                id: productId
            },
        });

        if(!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
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

        res.status(200).json({
            success: true,
            product: updatedProduct
        });
    
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


const deleteProduct = async (req, res) =>{
   
    try{

    const productId = Number(req.params.id);

    const existingProduct = await prisma.product.findUnique({
        where : {
            id : productId
        }
    })

    if(!existingProduct){
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    await prisma.product.delete({
        where: {
            id: productId
        }
    });

    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    });

    
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct };

