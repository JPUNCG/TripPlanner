# TripPlanner 

**Live Deployment:** https://tripplanner-u9zf.onrender.com/

TripPlanner is a centralized web application designed for travelers who want to organize their itineraries, travel notes, and real-time destination data in one place.

---

## Setup Instructions

To run this project locally on your machine:

1.  **Navigate** to the project folder in your terminal.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your Neon PostgreSQL database credentials:
    ```env
    DATABASE_URL=your_neon_postgres_connection_string
    ```
4.  **Start the server**:
    ```bash
    node server.js
    ```
5.  **Access the app**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Reflection

### Design Choices
* **Frontend:** Built with Vanilla JavaScript, HTML, and CSS. I chose this as the scope felt pretty small, I regret not using React instead.
* **Backend & External API:** Node.js with Express to build a lightweight, fast REST API. The app integrates the Open-Meteo API to dynamically fetch and display 7-day weather forecasts based on the destination.
* **Database Schema & Auth:** Used Neon PostgreSQL with a relational schema. I also implemented basic login functionality with a simple table.

### Challenges
The most challenging aspect was managing the DOM state without a frontend framework. Synchronizing the UI with the PostgreSQL database during every CRUD operation required annoying event handling to ensure a synced application.

### Learning Outcomes
I gained experience connecting a frontend to a backend via RESTful APIs, structuring relational SQL data, using JS HTML and CSS, and deploying a live application using Render. I am particularly proud of the UI/UX. I spent a lot of time on the CSS transitions and the modal layout to make it feel like a modern, website rather than a basic CRUD app.

---

## Future Work
* **AI Integration:** Integrate a LLM to provide AI-driven travel warnings and personalized suggestions.
* **Flight Tracking:** Implement a built-in flight tracker to further centralize the travel experience.