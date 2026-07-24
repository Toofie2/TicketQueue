// backend/api/historyRoutes.js
const express = require('express');
const router = express.Router();
const { history } = require('./mockDB');

// GET /api/history/:email
router.get('/:email', (req, res) => {
    const userEmail = req.params.email;
    
    // Filter the mock database to only return history for the logged-in user
    const userHistory = history.filter(record => record.email === userEmail);
    
    res.status(200).json(userHistory);
});

module.exports = router;