const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(50),
        username: z.string().min(3, "Username must be at least 3 characters").max(30),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters")
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address").optional(),
        username: z.string().optional(),
        password: z.string().min(1, "Password is required")
    }).refine(data => data.email || data.username, {
        message: "Either email or username must be provided",
        path: ["body"]
    })
});

module.exports = { registerSchema, loginSchema };
