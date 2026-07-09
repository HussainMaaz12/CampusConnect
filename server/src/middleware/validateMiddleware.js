const { z } = require('zod');

const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                code: 400,
                errors: (error.issues || error.errors || []).map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        return next(error);
    }
};

module.exports = { validate };
