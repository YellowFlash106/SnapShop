const { z } = require("zod");

const signUpSchema = z.object({
    body: z.object({
        name: z.string().trim().min(3).max(50),
        email: z.string().email(),
        password: z
            .string()
            .min(6)
            .regex(
                /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/, 
                "Password must contain uppercase, lowercase, number and special character"
            ),
    }),
    query: z.object({}),
    params: z.object({}),
});


const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
    }),
    query: z.object({}),
    params: z.object({}),
});


module.exports = { signUpSchema, loginSchema };