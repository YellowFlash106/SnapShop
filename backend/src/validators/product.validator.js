const { z } = require("zod");

const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(3).max(100),
        description: z.string().min(10).max(1000),
        price: z.number().positive(),
        category: z.string().min(3).max(50),
        stock: z.number().int().min(0),

        categoryId: z.coerce.number().int().positive().optional(),
    }),

    query: z.object({}),
    params: z.object({}),
});


const productQuerySchema = z.object({
    body: z.object({}),
    params: z.object({}),
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(50).default(10),
        search: z.string().optional(),
        category: z.string().optional(),
        maxPrice: z.coerce.number().optional(),
        minPrice: z.coerce.number().optional(),

        sortBy: z.enum(['name', 'price', 'createdAt']).optional(),

        order: z.enum(['asc', 'desc']).optional(),
    }),
});


module.exports = { createProductSchema, productQuerySchema };