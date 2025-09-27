<img width="863" height="775" alt="Screenshot 2025-09-27 184251" src="https://github.com/user-attachments/assets/9eced4fb-588d-456e-bb44-13362283512c" />

<img width="1352" height="869" alt="image" src="https://github.com/user-attachments/assets/3ff4bcfb-4e9b-4c32-b738-109fe3e0ebbe" />

Dentist Appointment Booking Platform
A full-stack web application that allows patients to book dental appointments and provides a dedicated schedule view for doctors. This project is built with React on the frontend and FastAPI on the backend.

Patient Booking View
Doctor's Schedule View
✨ Features
Dual User Roles: Separate interfaces and functionality for Patients and Doctors.

Secure Login System: A simple but effective role-based authentication system.

Interactive Appointment Booking (Patient View):

Select from different appointment types with varying durations (e.g., Check-up, Treatment, Operation).

Choose a date using an interactive calendar.

View a grid of dynamically calculated available time slots.

Book an appointment by providing patient details.

Daily Schedule Management (Doctor View):

View a clean, organized list of all appointments for any selected date.

See appointment times, patient names, and service types at a glance.

Dynamic Slot Calculation: The backend intelligently calculates available slots, accounting for existing appointments, service durations, and a fixed lunch break (13:00 - 14:00).

🛠️ Tech Stack
Frontend: React (with Vite), axios for API requests, and react-datepicker.

Backend: FastAPI (Python), Pydantic for data validation, and uvicorn for serving the application.

Database: A simple in-memory dictionary is used for demonstration purposes.

🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

Prerequisites
Python 3.8+

Node.js and npm

1. Backend Setup
First, navigate to the backend directory:

cd backend

Create and activate a Python virtual environment:

# For Windows
python -m venv venv
.\venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

Install the required Python packages:

pip install -r requirements.txt

Run the FastAPI server:

uvicorn main:app --reload

The backend will now be running on http://localhost:8000.

2. Frontend Setup
Open a new terminal and navigate to the frontend directory:

cd frontend

Install the required npm packages:

npm install

Run the React development server:

npm run dev

The frontend will now be running on http://localhost:5173.

usage
Once both servers are running, open your browser and navigate to http://localhost:5173. You will be greeted with the login screen.

Demo Login Credentials:
Patient Account:

Username: patient1

Password: password123

Doctor Account:

Username: doctor1

Password: doctorpass

📝 API Endpoints
The backend exposes the following endpoints:

POST /login: Authenticates a user and returns a token and role.

GET /allAvailableSlots: Returns available appointment slots for a given date and service type.

POST /appointments: Books a new appointment.

GET /doctor/schedule: Returns the full appointment schedule for a given date (for the doctor's view).

💡 Future Enhancements
Database Integration: Replace the in-memory database with a persistent one like PostgreSQL or MongoDB.

Appointment Cancellation: Allow doctors (and optionally patients) to cancel existing appointments.

Email/SMS Notifications: Integrate with a service like Twilio or SendGrid to send booking confirmations and reminders.

User Registration: Add a sign-up page for new patients.

📄 License
This project is licensed under the MIT License. See the LICENSE file for details.
