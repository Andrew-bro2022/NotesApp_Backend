const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../models/user.model');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        // Connect to a test database
        await mongoose.connect(process.env.MONGODB_URI + '_test', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    beforeEach(async () => {
        // Clear the users collection before each test
        await User.deleteMany({});
    });

    afterAll(async () => {
        // Disconnect after all tests are done
        await mongoose.connection.close();
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('username', 'testuser');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('should not create user with existing email', async () => {
            // First create a user
            await User.create({
                username: 'existinguser',
                email: 'test@example.com',
                password: 'password123'
            });

            // Try to create another user with same email
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    username: 'newuser',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user before each login test
            await request(app)
                .post('/api/auth/signup')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                });
        });

        it('should login existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('username', 'testuser');
        });

        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid login credentials');
        });
    });
});
