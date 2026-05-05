/*
Name: Jeethesh Pallinti
Date: 04.20.2026
CSC 372-01

Node.js Backend. Manages persistence and external API communication.
*/

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// POST simple login
app.post('/api/login', async (req, res) => {
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

// GET all trips
app.get('/api/trips', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trips ORDER BY start_date ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// GET activities for a trip
app.get('/api/trips/:id/activities', async (req, res) => {
    const result = await pool.query('SELECT * FROM activities WHERE trip_id = $1 ORDER BY id ASC', [req.params.id]);
    res.json(result.rows);
});

// POST new trip
app.post('/api/trips', async (req, res) => {
    const { destination, start_date, end_date, image_url, flight_number } = req.body;
    const result = await pool.query(
        'INSERT INTO trips (destination, start_date, end_date, image_url, flight_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [destination, start_date, end_date, image_url, flight_number]
    );
    res.json(result.rows[0]);
});

// PUT update trip details
app.put('/api/trips/:id', async (req, res) => {
    const { destination, start_date, end_date, image_url, flight_number } = req.body;
    const result = await pool.query(
        'UPDATE trips SET destination = $1, start_date = $2, end_date = $3, image_url = $4, flight_number = $5 WHERE id = $6 RETURNING *',
        [destination, start_date, end_date, image_url, flight_number, req.params.id]
    );
    res.json(result.rows[0]);
});

// PUT update trip notes
app.put('/api/trips/:id/notes', async (req, res) => {
    const { notes } = req.body;
    await pool.query('UPDATE trips SET notes = $1 WHERE id = $2', [notes, req.params.id]);
    res.sendStatus(200);
});

// DELETE trip
app.delete('/api/trips/:id', async (req, res) => {
    await pool.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
    res.sendStatus(200);
});

// POST new activity
app.post('/api/activities', async (req, res) => {
    const { trip_id, name, details } = req.body;
    const result = await pool.query(
        'INSERT INTO activities (trip_id, activity_name, activity_details) VALUES ($1, $2, $3) RETURNING *',
        [trip_id, name, details]
    );
    res.json(result.rows[0]);
});

// DELETE activity
app.delete('/api/activities/:id', async (req, res) => {
    await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
    res.sendStatus(200);
});

// GET weather forecast (7 days, Fahrenheit, Inches)
app.get('/api/weather', async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "City required" });

    try {
        // Step 1: Geocode
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            return res.status(404).json({ error: "City not found" });
        }

        const { latitude, longitude } = geoData.results[0];

        // Step 2: 7-Day Daily Weather Forecast (Fahrenheit & Inches)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        // Map arrays into a clean daily object structure
        const forecast = weatherData.daily.time.map((dateStr, i) => {
            return {
                date: dateStr,
                maxTemp: weatherData.daily.temperature_2m_max[i],
                minTemp: weatherData.daily.temperature_2m_min[i],
                precipitation: weatherData.daily.precipitation_sum[i]
            };
        });

        res.json({ forecast });
    } catch (err) {
        console.error("Weather API Error:", err);
        res.status(500).json({ error: "Weather fetch failed" });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));