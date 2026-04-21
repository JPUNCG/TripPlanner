/**
 * Name: Jeethesh Pallinti
 * Date: 04.20.2026
 * CSC 372-01
 * * This script handles the frontend logic for the Trip Planner application.
 * It manages state for the active trip, coordinates with the Node.js API
 * for data persistence, and dynamically updates the DOM using createElement.
 */

let activeTripId = null;
let editingTripId = null; 
let allTrips = []; 

function init() {
    fetchTrips();
    setupEventListeners();
}

function setupEventListeners() {
    const addBtn = document.getElementById('add-trip-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const tripForm = document.getElementById('trip-form');
    const activityForm = document.getElementById('activity-form');
    const saveNotesBtn = document.getElementById('save-notes-btn');
    const editTripBtn = document.getElementById('edit-trip-btn');
    const deleteTripBtn = document.getElementById('delete-trip-btn');

    addBtn.addEventListener('click', () => {
        editingTripId = null;
        document.getElementById('form-title').textContent = "Plan New Trip";
        tripForm.reset();
        document.getElementById('form-container').classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        document.getElementById('form-container').classList.add('hidden');
    });

    closeBtn.addEventListener('click', () => {
        document.getElementById('trip-modal').classList.add('hidden');
    });

    editTripBtn.addEventListener('click', openEditForm);
    deleteTripBtn.addEventListener('click', deleteActiveTrip);

    tripForm.addEventListener('submit', handleTripSubmit);
    activityForm.addEventListener('submit', handleActivitySubmit);
    saveNotesBtn.addEventListener('click', saveTripNotes);
}

async function fetchTrips() {
    try {
        const response = await fetch('/api/trips');
        allTrips = await response.json();
        renderTripGrid(allTrips);
    } catch (err) {
        console.error("Error fetching trips:", err);
    }
}

function renderTripGrid(trips) {
    const grid = document.getElementById('trip-grid');
    grid.innerHTML = ''; 

    trips.forEach(trip => {
        const card = document.createElement('div');
        card.className = 'trip-card';
        card.addEventListener('click', () => openTripModal(trip));

        const imgDiv = document.createElement('div');
        imgDiv.className = 'card-img';
        imgDiv.style.backgroundImage = trip.image_url ? `url(${trip.image_url})` : 'linear-gradient(135deg, var(--primary), var(--primary-hover))';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';

        const title = document.createElement('h3');
        title.textContent = trip.destination;

        const dateRange = document.createElement('p');
        dateRange.textContent = `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`;

        contentDiv.appendChild(title);
        contentDiv.appendChild(dateRange);
        card.appendChild(imgDiv);
        card.appendChild(contentDiv);
        grid.appendChild(card);
    });
}

function openTripModal(trip) {
    activeTripId = trip.id;
    const modal = document.getElementById('trip-modal');
    modal.classList.remove('hidden');

    document.getElementById('modal-title').textContent = trip.destination;
    document.getElementById('modal-dates').textContent = `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`;
    document.getElementById('modal-header').style.backgroundImage = trip.image_url ? `url(${trip.image_url})` : 'linear-gradient(135deg, var(--primary), var(--primary-hover))';

    document.getElementById('trip-notes').value = trip.notes || '';

    // Flight Tracking Sample Text
    const flight = trip.flight_number || 'N/A';
    document.getElementById('flight-info').innerHTML = `
        <p><strong>Status:</strong> <span style="color: #10b981;">On Time</span></p>
        <p><strong>Flight:</strong> ${flight}</p>
        <p><strong>Gate:</strong> B12</p>
        <p style="font-size: 0.8rem; margin-top: 5px; font-style: italic;">Live tracking API placeholder</p>
    `;

    // AI Suggestions Sample Text
    document.getElementById('ai-suggestions').innerHTML = `
        <p>Based on your trip to <strong>${trip.destination}</strong>, you might enjoy visiting the local historic district and trying the seasonal food markets.</p>
        <p><em>Pro-tip: Wednesday mornings are the least crowded!</em></p>
    `;

    updateWeather(trip.destination);
    fetchActivities(trip.id);
}

function formatForInput(isoString) {
    if(!isoString) return '';
    return new Date(isoString).toISOString().split('T')[0];
}

function openEditForm() {
    const trip = allTrips.find(t => t.id === activeTripId);
    if (!trip) return;

    editingTripId = trip.id;
    document.getElementById('form-title').textContent = "Edit Trip";
    
    document.getElementById('dest-input').value = trip.destination;
    document.getElementById('img-input').value = trip.image_url || '';
    document.getElementById('start-input').value = formatForInput(trip.start_date);
    document.getElementById('end-input').value = formatForInput(trip.end_date);
    document.getElementById('flight-input').value = trip.flight_number || '';

    document.getElementById('form-container').classList.remove('hidden');
}

async function handleTripSubmit(e) {
    e.preventDefault();
    const tripData = {
        destination: document.getElementById('dest-input').value,
        start_date: document.getElementById('start-input').value,
        end_date: document.getElementById('end-input').value,
        image_url: document.getElementById('img-input').value,
        flight_number: document.getElementById('flight-input').value
    };

    const method = editingTripId ? 'PUT' : 'POST';
    const url = editingTripId ? `/api/trips/${editingTripId}` : '/api/trips';

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
    });

    if (response.ok) {
        e.target.reset();
        document.getElementById('form-container').classList.add('hidden');
        
        if (editingTripId) {
            const updatedTrip = await response.json();
            openTripModal(updatedTrip); 
        }
        
        fetchTrips();
    }
}

async function deleteActiveTrip() {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    await fetch(`/api/trips/${activeTripId}`, { method: 'DELETE' });
    document.getElementById('trip-modal').classList.add('hidden');
    fetchTrips();
}

async function updateWeather(city) {
    const widget = document.getElementById('weather-widget');
    widget.innerHTML = '<p>Loading forecast...</p>'; 

    try {
        const cityName = city.split(',')[0].trim();
        let response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
        
        if (!response.ok) throw new Error("API Error");
        let data = await response.json();

        widget.innerHTML = `
            <p><strong>Current Temp:</strong> ${data.temperature}°C</p>
            <p><strong>Windspeed:</strong> ${data.windspeed} km/h</p>
        `;
    } catch (err) {
        widget.innerHTML = `<p style="color: #ef4444;">Weather data unavailable.</p>`;
    }
}

async function saveTripNotes() {
    const notes = document.getElementById('trip-notes').value;
    if (!activeTripId) return;

    await fetch(`/api/trips/${activeTripId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
    });
}

async function handleActivitySubmit(e) {
    e.preventDefault();
    const activityData = {
        trip_id: activeTripId,
        name: document.getElementById('act-name').value,
        details: "" 
    };

    const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
    });

    if (response.ok) {
        e.target.reset();
        fetchActivities(activeTripId);
    }
}

async function deleteActivity(activityId) {
    await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
    fetchActivities(activeTripId);
}

async function fetchActivities(tripId) {
    const response = await fetch(`/api/trips/${tripId}/activities`);
    const activities = await response.json();
    const list = document.getElementById('activities-list');
    list.innerHTML = '';

    activities.forEach(act => {
        const li = document.createElement('li');
        li.textContent = act.activity_name;
        
        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.className = 'delete-act-btn';
        delBtn.addEventListener('click', () => deleteActivity(act.id));

        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

function formatDate(dateStr) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

window.addEventListener('load', init);