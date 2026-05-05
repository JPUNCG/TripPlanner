// routes/activities.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST new activity
router.post('/', async (req, res) => {
    const { trip_id, name, details } = req.body;
    const result = await pool.query(
        'INSERT INTO activities (trip_id, activity_name, activity_details) VALUES ($1, $2, $3) RETURNING *',
        [trip_id, name, details]
    );
    res.json(result.rows[0]);
});

// DELETE activity
router.delete('/:id', async (req, res) => {
    await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
    res.sendStatus(200);
});

module.exports = router;