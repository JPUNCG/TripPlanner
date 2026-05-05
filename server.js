/*
Name: Jeethesh Pallinti
Date: 04.20.2026
CSC 372-01

Node.js Backend Entry Point.
*/

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Route Modules
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const activityRoutes = require('./routes/activities');
const weatherRoutes = require('./routes/weather');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Mount Routes
app.use('/api/login', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/weather', weatherRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));