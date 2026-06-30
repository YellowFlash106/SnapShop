const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if(!result.success) {
            const errorMessages = result.error.errors.map(err => err.message).join(", ");
            return res.status(400).json({
                success: false,
                message: `Validation error: ${errorMessages}`,
            });
        }

        req.body = result.data.body;
        req.query = result.data.query;
        req.params = result.data.params;

        next();
    }
}

module.exports = { validate };