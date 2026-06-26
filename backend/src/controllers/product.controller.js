
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

        const { category, minPrice, maxPrice } = req.query;

        const where = {};
        
        if(category){
            where.category = {
                name: {
                    equals: category,
                    mode: "insensitive"
                }
            };
        }
        if(minPrice || maxPrice){
            where.price = {};

            if(minPrice){
                where.price.gte = Number(minPrice);
            }
            if(maxPrice){
                where.price.lte = Number(maxPrice);
            }
        }

        const products = await prisma.product.findMany({
            where: {
                ...where,
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
                ...where,
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


const searchProducts = async (req, res) => {
  try {
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

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


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

const addReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        const parsedProductId = Number(productId);

        if (!Number.isInteger(parsedProductId)) {
            return res.status(400).json({
                success: false,
                message: "Product id must be a number"
            });
        }

        const product = await prisma.product.findUnique({
            where: { id: parsedProductId },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
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
                        email: true
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            review
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await prisma.review.findMany({
            where: { productId: Number(productId) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            reviews
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const parsedProductId = Number(productId);

        if (!Number.isInteger(parsedProductId)) {
            return res.status(400).json({
                success: false,
                message: "Product id must be a number"
            });
        }

        const item = await prisma.wishlist.create({
            data: {
                userId: req.user.id,
                productId: parsedProductId
            }
        })

        return res.status(201).json({
            success: true,
            message: "Item added to wishlist successfully",
            item
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const getWishlist = async (req, res) => {

    try {
        const items = await prisma.wishlist.findMany({
            where: { userId: req.user.id },
            include: {
                product: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully",
            items
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const parsedProductId = Number(productId);

        if (!Number.isInteger(parsedProductId)) {
            return res.status(400).json({
                success: false,
                message: "Product id must be a number"
            });
        }

        await prisma.wishlist.deleteMany({
            where: {
                userId: req.user.id,
                productId: parsedProductId
            }
        });

        return res.status(200).json({
            success: true,
            message: "Item removed from wishlist successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}



module.exports = { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct , searchProducts, addReview, getProductReviews, addToWishlist, getWishlist, removeFromWishlist };

