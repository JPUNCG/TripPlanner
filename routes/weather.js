// routes/weather.js
const express = require('express');
const router = express.Router();

// GET weather forecast
router.get('/', async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "City required" });

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            return res.status(404).json({ error: "City not found" });
        }

        const { latitude, longitude } = geoData.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

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

module.exports = router;