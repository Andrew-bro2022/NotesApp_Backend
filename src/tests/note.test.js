const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../models/user.model');
const Note = require('../models/note.model');

describe('Note Endpoints', () => {
    let authToken;
    let userId;
    let testNoteId;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI + '_test', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    beforeEach(async () => {
        // Clear the collections
        await User.deleteMany({});
        await Note.deleteMany({});

        // Create a test user and get auth token
        const userRes = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });

        authToken = userRes.body.token;
        userId = userRes.body.user._id;

        // Create a test note
        const noteRes = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Test Note',
                content: 'Test Content',
                tags: ['test']
            });

        testNoteId = noteRes.body._id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('GET /api/notes', () => {
        it('should get all notes for authenticated user', async () => {
            const res = await request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toHaveProperty('title', 'Test Note');
        });

        it('should fail without auth token', async () => {
            const res = await request(app)
                .get('/api/notes');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/notes', () => {
        it('should create a new note', async () => {
            const res = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'New Note',
                    content: 'New Content',
                    tags: ['new']
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('title', 'New Note');
            expect(res.body).toHaveProperty('owner', userId);
        });
    });

    describe('GET /api/notes/:id', () => {
        it('should get note by id', async () => {
            const res = await request(app)
                .get(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', 'Test Note');
        });

        it('should not get note with invalid id', async () => {
            const res = await request(app)
                .get('/api/notes/invalidid')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(500);
        });
    });

    describe('PUT /api/notes/:id', () => {
        it('should update note', async () => {
            const res = await request(app)
                .put(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Note',
                    content: 'Updated Content'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', 'Updated Note');
            expect(res.body).toHaveProperty('content', 'Updated Content');
        });
    });

    describe('DELETE /api/notes/:id', () => {
        it('should delete note', async () => {
            const res = await request(app)
                .delete(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);

            // Verify note is deleted
            const getRes = await request(app)
                .get(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(getRes.statusCode).toBe(404);
        });
    });

    describe('POST /api/notes/:id/share', () => {
        it('should share note with another user', async () => {
            // Create another user
            const anotherUser = await request(app)
                .post('/api/auth/signup')
                .send({
                    username: 'anotheruser',
                    email: 'another@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .post(`/api/notes/${testNoteId}/share`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    username: 'anotheruser'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.note.sharedWith).toContain(anotherUser.body.user._id);
        });
    });

    describe('GET /api/notes/search', () => {
        it('should search notes by query', async () => {
            // Create a note with specific content
            await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Searchable Note',
                    content: 'This is a unique searchable content',
                    tags: ['search']
                });

            const res = await request(app)
                .get('/api/notes/search?q=unique searchable')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('title', 'Searchable Note');
        });
    });
});
