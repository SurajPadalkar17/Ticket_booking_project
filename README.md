**Dentist Appointment Booking Platform**


<img width="500" height="600" alt="Screenshot 2025-09-27 184251" src="https://github.com/user-attachments/assets/9eced4fb-588d-456e-bb44-13362283512c" />

<img width="500" height="600" alt="image" src="https://github.com/user-attachments/assets/3ff4bcfb-4e9b-4c32-b738-109fe3e0ebbe" />

**Steps**
1. Run the Backend
First, set up and start the backend server.

Navigate to the backend directory:

Bash

cd backend
Create and activate a virtual environment:

Bash

# On Windows
python -m venv venv
.\\venv\\Scripts\\activate
Install Python packages:

Bash

pip install -r requirements.txt
Start the server:

Bash

uvicorn main:app --reload
Leave this terminal running. The backend will be live at http://localhost:8000.

2. Run the Frontend
Open a new terminal window for the frontend.

Navigate to the frontend directory:

Bash

cd frontend
Install Node.js packages:

Bash

npm install
Start the development server:

Bash

npm run dev
The frontend will be live at http://localhost:5173.
