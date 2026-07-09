process.env.JWT_SECRET = 'testsecret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { app } = require('../src/app');

describe('Auth Endpoints', () => {
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Test User',
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBeTruthy();
        expect(res.body.token).toBeDefined();
    });

    it('should fail registration with invalid input (Zod Validation)', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'T', 
                username: 'testuser',
                email: 'invalid-email', 
                password: 'pass' 
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBeFalsy();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should login successfully', async () => {
        
        await request(app).post('/api/v1/auth/register').send({
            name: 'Login User',
            username: 'loginuser',
            email: 'login@example.com',
            password: 'password123'
        });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'login@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBeTruthy();
        expect(res.body.token).toBeDefined();
    });
});
