process.env.JWT_SECRET = 'testsecret';
process.env.NODE_ENV = 'test';
process.env.MASTER_DEV_PASSWORD = 'adminpassword';

const request = require('supertest');
const { app, setupMasterAccount } = require('../src/app');
const User = require('../src/models/User');

describe('Admin Endpoints', () => {
    let adminToken;
    let testUserId;

    beforeEach(async () => {
        
        await setupMasterAccount();

        const resAdmin = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: "admin@campusconnect.local", password: 'adminpassword' });
        adminToken = resAdmin.body.token;

        
        await User.updateOne({ email: "admin@campusconnect.local" }, { isTwoFactorEnabled: true });

        const resUser = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Normal User',
                username: 'normaluser',
                email: 'normal@example.com',
                password: 'password123'
            });
        testUserId = resUser.body.user._id;
    });

    it('should grant post permission (Admin Only)', async () => {
        const res = await request(app)
            .put(`/api/v1/admin/grant/${testUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBeTruthy();
        expect(res.body.user.canPost).toBe(true);
    });

    it('should prevent non-admin from granting permissions', async () => {
        
        const resNormal = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Another User',
                username: 'another',
                email: 'another@example.com',
                password: 'password123'
            });
        const normalToken = resNormal.body.token;

        const res = await request(app)
            .put(`/api/v1/admin/grant/${testUserId}`)
            .set('Authorization', `Bearer ${normalToken}`);
        
        expect(res.statusCode).toEqual(403);
    });
});
