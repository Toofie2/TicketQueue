import express from 'express';
import request from 'supertest';
import authRoutes from './authRoutes.js';
import historyRoutes from './historyRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

describe('Authentication Module Tests', () => {
    
    test('Should return 400 if registration fields are missing', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: "test@test.com" }); // Missing password and role
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("All fields are required (email, password, role).");
    });

    test('Should successfully register a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: "newuser@test.com", password: "password123", role: "User" });
        
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Registration successful!");
    });

    test('Should login successfully with correct credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: "newuser@test.com", password: "password123" });
        
        expect(response.status).toBe(200);
        expect(response.body.role).toBe("User");
    });
});

describe('History Module Tests', () => {
    test('Should return history for a specific user', async () => {
        // harpreet@test.com is hardcoded in your mockDB.js
        const response = await request(app).get('/api/history/harpreet@test.com');
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});