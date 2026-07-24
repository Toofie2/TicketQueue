import express from 'express';
import { history } from './mockDB.js';

const router = express.Router();

// GET /api/history/:email
router.get('/:email', (req, res) => {
    const userEmail = req.params.email;
    const userHistory = history.filter(record => record.email === userEmail);
    res.status(200).json(userHistory);
});

export default router;