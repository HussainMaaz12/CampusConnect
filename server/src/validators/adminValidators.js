const { z } = require('zod');
const { Types } = require('mongoose');

const objectIdSchema = z.string().refine(val => Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId"
});

const permissionSchema = z.object({
    params: z.object({
        userId: objectIdSchema
    })
});

const searchSchema = z.object({
    query: z.object({
        search: z.string().optional()
    })
});

module.exports = { permissionSchema, searchSchema };
