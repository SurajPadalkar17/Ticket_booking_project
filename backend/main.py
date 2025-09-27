import os
from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, time, timedelta
import uuid

# --- App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Databases ---
appointments_db = {}

# --- User Database and Authentication ---
users_db = {
    "patient1": {"password": "password123", "role": "patient"},
    "doctor1": {"password": "doctorpass", "role": "doctor"},
}

active_tokens = {}

class UserLogin(BaseModel):
    username: str
    password: str

# --- Pydantic Models ---
class Appointment(BaseModel):
    patient_name: str
    contact_info: str
    appointment_type: str
    appointment_time: datetime

class AppointmentInDB(Appointment):
    id: str

# --- Configuration ---
# CORRECTED THE TYPO ON THE NEXT LINE
APPOINTMENT_DURATIONS = {
    "Regular Check-up": timedelta(minutes=30),
    "Specific Treatment": timedelta(minutes=60),
    "Operation": timedelta(minutes=120),
}
CLINIC_OPEN = time(9, 30)
CLINIC_CLOSE = time(20, 0)
LUNCH_START = time(13, 0)
LUNCH_END = time(14, 0)

# --- Helper Functions ---
def generate_all_slots(day: datetime, duration: timedelta):
    slots = []
    current_time = datetime.combine(day, CLINIC_OPEN)
    end_time = datetime.combine(day, CLINIC_CLOSE)
    while current_time + duration <= end_time:
        slot_end_time = current_time + duration
        is_in_lunch = not (slot_end_time.time() <= LUNCH_START or current_time.time() >= LUNCH_END)
        if not is_in_lunch:
            slots.append(current_time)
        current_time += timedelta(minutes=30)
    return slots

# --- API Endpoints ---

# --- Authentication Endpoint ---
@app.post("/login")
def login(user_credentials: UserLogin):
    user = users_db.get(user_credentials.username)
    if not user or user["password"] != user_credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = str(uuid.uuid4())
    active_tokens[token] = user_credentials.username
    return {"token": token, "role": user["role"], "username": user_credentials.username}

# --- Appointment Booking Endpoints ---
@app.post("/appointments", response_model=AppointmentInDB)
def book_appointment(appointment: Appointment):
    appointment_day_str = appointment.appointment_time.strftime("%Y-%m-%d")
    if appointment.appointment_type not in APPOINTMENT_DURATIONS:
        raise HTTPException(status_code=400, detail="Invalid appointment type.")
    day_appointments = appointments_db.get(appointment_day_str, [])
    for existing_apt in day_appointments:
        if existing_apt.appointment_time == appointment.appointment_time:
            raise HTTPException(status_code=409, detail="This time slot is already booked.")
    new_appointment = AppointmentInDB(id=str(uuid.uuid4()), **appointment.dict())
    if appointment_day_str not in appointments_db:
        appointments_db[appointment_day_str] = []
    appointments_db[appointment_day_str].append(new_appointment)
    appointments_db[appointment_day_str].sort(key=lambda x: x.appointment_time)
    return new_appointment

@app.get("/allAvailableSlots")
def get_available_slots(date: str = Query(...), type: str = Query(...)):
    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    if type not in APPOINTMENT_DURATIONS:
        raise HTTPException(status_code=400, detail="Invalid appointment type.")
    duration = APPOINTMENT_DURATIONS[type]
    all_possible_slots = generate_all_slots(selected_date, duration)
    day_appointments = appointments_db.get(date, [])
    booked_times = {apt.appointment_time for apt in day_appointments}
    available_slots = [
        slot.strftime("%H:%M") for slot in all_possible_slots if slot not in booked_times
    ]
    return {"available_slots": available_slots}

# --- Doctor-Specific Endpoint ---
@app.get("/doctor/schedule")
def get_doctor_schedule(date: str = Query(...)):
    day_appointments = appointments_db.get(date, [])
    return {"schedule": day_appointments}

# --- Health Check Endpoint ---
@app.get("/")
def read_root():
    return {"status": "Dentist Appointment API with Auth is running."}

