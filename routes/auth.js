const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST simple login (Mounted at /api/login)
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );
        
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0].username });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;