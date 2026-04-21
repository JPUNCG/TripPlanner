/*
Name: Jeethesh Pallinti
Date: 04.20.2026
CSC 372-01

This script handles the frontend logic for the Trip Planner application.
It manages state for the active trip, coordinates with the Node.js API
for data persistence, and dynamically updates the DOM using createElement.
*/

let activeTripId = null;
let editingTripId = null; 
let allTrips = []; 

/**
 * Initializes the application by fetching trips and setting up listeners.
 */
function init() {
    fetchTrips();
    setupEventListeners();
}

/**
 * Attaches event listeners to interactive DOM elements.
 */
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

/**
 * Fetches all trips from the API and renders them on the page.
 */
async function fetchTrips() {
    try {
        const response = await fetch('/api/trips');
        allTrips = await response.json();
        renderTripGrid(allTrips);
    } catch (err) {
        console.error("Error fetching trips:", err);
    }
}

/**
 * Renders the grid of trip cards.
 * @param {Array} trips - The array of trip objects to render
 */
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

/**
 * Opens the detailed modal for a specific trip and populates the data.
 * @param {Object} trip - The trip object to display
 */
function openTripModal(trip) {
    activeTripId = trip.id;
    const modal = document.getElementById('trip-modal');
    modal.classList.remove('hidden');

    document.getElementById('modal-title').textContent = trip.destination;
    document.getElementById('modal-dates').textContent = `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`;
    document.getElementById('modal-header').style.backgroundImage = trip.image_url ? `url(${trip.image_url})` : 'linear-gradient(135deg, var(--primary), var(--primary-hover))';

    document.getElementById('trip-notes').value = trip.notes || '';

    // Flight Tracking Sample Text Generation
    const flight = trip.flight_number || 'N/A';
    const flightInfo = document.getElementById('flight-info');
    flightInfo.innerHTML = ''; 

    const statusP = document.createElement('p');
    const statusStrong = document.createElement('strong');
    statusStrong.textContent = 'Status: ';
    const statusSpan = document.createElement('span');
    statusSpan.textContent = 'On Time';
    statusSpan.className = 'status-on-time';
    statusP.appendChild(statusStrong);
    statusP.appendChild(statusSpan);

    const flightP = document.createElement('p');
    const flightStrong = document.createElement('strong');
    flightStrong.textContent = 'Flight: ';
    flightP.appendChild(flightStrong);
    flightP.appendChild(document.createTextNode(flight));

    const gateP = document.createElement('p');
    const gateStrong = document.createElement('strong');
    gateStrong.textContent = 'Gate: ';
    gateP.appendChild(gateStrong);
    gateP.appendChild(document.createTextNode('B12'));

    const tipP = document.createElement('p');
    tipP.textContent = 'Live tracking API placeholder';
    tipP.className = 'italic-tip';

    flightInfo.appendChild(statusP);
    flightInfo.appendChild(flightP);
    flightInfo.appendChild(gateP);
    flightInfo.appendChild(tipP);

    // AI Suggestions Sample Text Generation
    const aiSug = document.getElementById('ai-suggestions');
    aiSug.innerHTML = ''; 

    const p1 = document.createElement('p');
    p1.textContent = 'Based on your trip to ';
    const strongDest = document.createElement('strong');
    strongDest.textContent = trip.destination;
    p1.appendChild(strongDest);
    p1.appendChild(document.createTextNode(', you might enjoy visiting the local historic district and trying the seasonal food markets.'));

    const p2 = document.createElement('p');
    const emTip = document.createElement('em');
    emTip.textContent = 'Pro-tip: Wednesday mornings are the least crowded!';
    p2.appendChild(emTip);

    aiSug.appendChild(p1);
    aiSug.appendChild(p2);

    updateWeather(trip.destination);
    fetchActivities(trip.id);
}

/**
 * Formats an ISO string to YYYY-MM-DD for date inputs.
 * @param {string} isoString - The ISO date string
 * @return {string} The formatted date string
 */
function formatForInput(isoString) {
    if(!isoString) return '';
    return new Date(isoString).toISOString().split('T')[0];
}

/**
 * Opens the form pre-filled with data to edit an existing trip.
 */
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

/**
 * Handles the submission of the trip form (create or edit).
 * @param {Event} e - The form submit event
 */
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

/**
 * Deletes the currently active trip after confirmation.
 */
async function deleteActiveTrip() {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    await fetch(`/api/trips/${activeTripId}`, { method: 'DELETE' });
    document.getElementById('trip-modal').classList.add('hidden');
    fetchTrips();
}

/**
 * Fetches and displays weather data for a given city.
 * @param {string} city - The name of the city
 */
async function updateWeather(city) {
    const widget = document.getElementById('weather-widget');
    widget.innerHTML = ''; 
    
    const loadingP = document.createElement('p');
    loadingP.textContent = 'Loading forecast...';
    widget.appendChild(loadingP);

    try {
        const cityName = city.split(',')[0].trim();
        let response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`);
        
        if (!response.ok) throw new Error("API Error");
        let data = await response.json();

        widget.innerHTML = '';

        const tempP = document.createElement('p');
        const tempStrong = document.createElement('strong');
        tempStrong.textContent = 'Current Temp: ';
        tempP.appendChild(tempStrong);
        tempP.appendChild(document.createTextNode(`${data.temperature}°C`));

        const windP = document.createElement('p');
        const windStrong = document.createElement('strong');
        windStrong.textContent = 'Windspeed: ';
        windP.appendChild(windStrong);
        windP.appendChild(document.createTextNode(`${data.windspeed} km/h`));

        widget.appendChild(tempP);
        widget.appendChild(windP);
    } catch (err) {
        widget.innerHTML = '';
        const errP = document.createElement('p');
        errP.textContent = 'Weather data unavailable.';
        errP.className = 'error-text';
        widget.appendChild(errP);
    }
}

/**
 * Saves notes written in the textarea to the backend database.
 */
async function saveTripNotes() {
    const notes = document.getElementById('trip-notes').value;
    if (!activeTripId) return;

    await fetch(`/api/trips/${activeTripId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
    });
}

/**
 * Handles the submission of the new activity form.
 * @param {Event} e - The form submit event
 */
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

/**
 * Deletes a specific activity from a trip.
 * @param {number|string} activityId - The ID of the activity to delete
 */
async function deleteActivity(activityId) {
    await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
    fetchActivities(activeTripId);
}

/**
 * Fetches and renders activities for a given trip.
 * @param {number|string} tripId - The ID of the trip
 */
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

/**
 * Formats a date string into a localized, readable format.
 * @param {string} dateStr - The date string to format
 * @return {string} The human-readable date string
 */
function formatDate(dateStr) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

window.addEventListener('load', init);