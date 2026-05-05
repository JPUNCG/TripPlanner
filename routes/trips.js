// routes/trips.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all trips
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trips ORDER BY start_date ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// POST new trip
router.post('/', async (req, res) => {
    const { destination, start_date, end_date, image_url, flight_number } = req.body;
    const result = await pool.query(
        'INSERT INTO trips (destination, start_date, end_date, image_url, flight_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [destination, start_date, end_date, image_url, flight_number]
    );
    res.json(result.rows[0]);
});

// GET activities for a trip
router.get('/:id/activities', async (req, res) => {
    const result = await pool.query('SELECT * FROM activities WHERE trip_id = $1 ORDER BY id ASC', [req.params.id]);
    res.json(result.rows);
});

// PUT update trip details
router.put('/:id', async (req, res) => {
    const { destination, start_date, end_date, image_url, flight_number } = req.body;
    const result = await pool.query(
        'UPDATE trips SET destination = $1, start_date = $2, end_date = $3, image_url = $4, flight_number = $5 WHERE id = $6 RETURNING *',
        [destination, start_date, end_date, image_url, flight_number, req.params.id]
    );
    res.json(result.rows[0]);
});

// PUT update trip notes
router.put('/:id/notes', async (req, res) => {
    const { notes } = req.body;
    await pool.query('UPDATE trips SET notes = $1 WHERE id = $2', [notes, req.params.id]);
    res.sendStatus(200);
});

// DELETE trip
router.delete('/:id', async (req, res) => {
    await pool.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
    res.sendStatus(200);
});

module.exports = router;