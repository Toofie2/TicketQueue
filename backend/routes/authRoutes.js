import express from 'express';
import { users } from './mockDB.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: "All fields are required (email, password, role)." });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: "User already exists." });
    }

    const newUser = { email, password, role };
    users.push(newUser);
    
    res.status(201).json({ message: "Registration successful!", user: { email: newUser.email, role: newUser.role } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    res.status(200).json({ 
        message: "Login successful!", 
        role: user.role,
        email: user.email
    });
});

export default router;