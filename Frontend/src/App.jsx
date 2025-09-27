import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- Configuration ---
const API_URL = 'http://localhost:8000';
const APPOINTMENT_TYPES = {
  "Regular Check-up": 30,
  "Specific Treatment": 60,
  "Operation": 120,
};

// --- Main App Component ---
function App() {
  const [user, setUser] = useState(null); // Will store { token, role, username }

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // The GlobalStyles component is now here, so styles apply to ALL views.
  return (
    <>
      <GlobalStyles />
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div>
          <Header username={user.username} onLogout={handleLogout} />
          {user.role === 'patient' && <PatientView />}
          {user.role === 'doctor' && <DoctorView />}
        </div>
      )}
    </>
  );
}

// --- Login Page Component ---
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      onLogin(response.data);
    } catch (err) {
      setError('Invalid username or password.');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h2>Clinic Portal Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn">Login</button>
        </form>
         <div className="login-info">
            <p><b>Patient Login:</b> patient1 / password123</p>
            <p><b>Doctor Login:</b> doctor1 / doctorpass</p>
        </div>
      </div>
    </div>
  );
}

// --- Patient Booking View Component ---
function PatientView() {
    const [appointmentType, setAppointmentType] = useState(Object.keys(APPOINTMENT_TYPES)[0]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [patientName, setPatientName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const fetchSlots = async () => {
          if (!selectedDate || !appointmentType) return;
          setIsLoading(true);
          setError('');
          setAvailableSlots([]);
          setSelectedSlot(null);
          const formattedDate = selectedDate.toISOString().split('T')[0];
          try {
            const response = await axios.get(`${API_URL}/allAvailableSlots`, { params: { date: formattedDate, type: appointmentType } });
            setAvailableSlots(response.data.available_slots);
          } catch (err) {
            setError('Failed to fetch slots. The server may be down.');
          } finally {
            setIsLoading(false);
          }
        };
        fetchSlots();
    }, [selectedDate, appointmentType]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSlot || !patientName || !contactInfo) {
            setError('Please fill all fields and select a slot.');
            return;
        }
        setError('');
        const [hours, minutes] = selectedSlot.split(':');
        const appointmentDateTime = new Date(selectedDate);
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const bookingData = { patient_name: patientName, contact_info: contactInfo, appointment_type: appointmentType, appointment_time: appointmentDateTime.toISOString() };
        try {
            await axios.post(`${API_URL}/appointments`, bookingData);
            setBookingSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Booking failed.');
        }
    };

    if (bookingSuccess) {
        return (
            <div className="container">
                <div className="success-card">
                    <h2>Booking Confirmed!</h2>
                    <p>Your appointment is successfully booked.</p>
                    <button onClick={() => setBookingSuccess(false)}>Book Another Appointment</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container">
            <header className="page-header">
                <h1>Book a Dentist Appointment</h1>
                <p>Choose a service, pick a date, and select a time slot.</p>
            </header>
            <main>
                <div className="card">
                    <h2>1. Select Service & Date</h2>
                    <div className="form-group">
                        <label>Appointment Type</label>
                        <select value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)}>
                            {Object.keys(APPOINTMENT_TYPES).map((type) => <option key={type} value={type}>{type} ({APPOINTMENT_TYPES[type]} min)</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} minDate={new Date()} dateFormat="MMMM d, yyyy" className="date-picker-input"/>
                    </div>
                </div>
                <div className="card">
                    <h2>2. Choose an Available Slot</h2>
                    {isLoading && <p>Loading available slots...</p>}
                    {error && !isLoading && <p className="error-message">{error}</p>}
                    {!isLoading && availableSlots.length > 0 && (
                        <div className="slots-grid">
                            {availableSlots.map(slot => <button key={slot} className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`} onClick={() => setSelectedSlot(slot)}>{slot}</button>)}
                        </div>
                    )}
                    {!isLoading && availableSlots.length === 0 && !error && <p>No slots available for this day. Please try another date.</p>}
                </div>
                {selectedSlot && (
                    <div className="card">
                        <h2>3. Confirm Your Booking for {selectedSlot}</h2>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Contact Info (Email or Phone)</label>
                                <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required />
                            </div>
                            <button type="submit" className="submit-btn">Confirm Booking</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

// --- Doctor Schedule View Component ---
function DoctorView() {
    const [schedule, setSchedule] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSchedule = async () => {
            setIsLoading(true);
            setError('');
            const formattedDate = selectedDate.toISOString().split('T')[0];
            try {
                const response = await axios.get(`${API_URL}/doctor/schedule`, { params: { date: formattedDate } });
                setSchedule(response.data.schedule);
            } catch (err) {
                setError('Failed to fetch schedule.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSchedule();
    }, [selectedDate]);

    return (
        <div className="container">
            <header className="page-header">
                <h1>Doctor's Daily Schedule</h1>
                <p>View all appointments for a selected date.</p>
            </header>
            <main>
                <div className="card">
                    <h2>Select Date</h2>
                    <div className="form-group">
                        <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="MMMM d, yyyy" className="date-picker-input"/>
                    </div>
                </div>
                <div className="card">
                    <h2>Appointments for {selectedDate.toLocaleDateString()}</h2>
                    {isLoading && <p>Loading schedule...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {!isLoading && schedule.length > 0 && (
                        <div>
                            <div className="schedule-header">
                                <span className="time">Time</span>
                                <span className="patient">Patient Name</span>
                                <span className="service">Service</span>
                            </div>
                            <ul className="schedule-list">
                                {schedule.map(apt => (
                                    <li key={apt.id}>
                                        <span className="time">{new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="patient">{apt.patient_name}</span>
                                        <span className="service">{apt.appointment_type}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {!isLoading && schedule.length === 0 && !error && <p>No appointments scheduled for this day.</p>}
                </div>
            </main>
        </div>
    );
}

// --- Shared Components & Styles ---
function Header({ username, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <span>Welcome, <strong>{username}</strong></span>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </header>
  );
}

const GlobalStyles = () => (
    <style>{`
        /* --- CSS Variables and Global Styles --- */
        :root { 
            --primary-color: #0d6efd; 
            --primary-hover: #0b5ed7;
            --background-color: #f8f9fa; 
            --card-background: #ffffff; 
            --text-color: #212529;
            --muted-text-color: #6c757d;
            --light-gray: #dee2e6;
            --success-color: #198754;
            --error-color: #dc3545;
            --font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif;
            --card-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
            --card-border-radius: 0.5rem;
        }
        body { margin: 0; font-family: var(--font-family); background-color: var(--background-color); color: var(--text-color); -webkit-font-smoothing: antialiased; }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        
        /* --- Card and Form Styles --- */
        .card { background-color: var(--card-background); border-radius: var(--card-border-radius); box-shadow: var(--card-shadow); padding: 2rem; margin-bottom: 2rem; }
        .page-header { text-align: center; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .page-header p { font-size: 1.1rem; color: var(--muted-text-color); }
        h2 { margin-top: 0; border-bottom: 1px solid var(--light-gray); padding-bottom: 1rem; margin-bottom: 1.5rem; color: var(--primary-color); font-size: 1.75rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
        select, input[type="text"], input[type="password"], .date-picker-input { 
            width: 100%; 
            padding: 0.75rem 1rem; 
            border: 1px solid var(--light-gray); 
            border-radius: 0.375rem; 
            box-sizing: border-box; 
            font-size: 1rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        select:focus, input:focus, .date-picker-input:focus { border-color: var(--primary-color); outline: 0; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); }
        .react-datepicker-wrapper { display: block; }

        /* --- Buttons --- */
        .submit-btn, .success-card button { width: 100%; padding: 0.875rem; background-color: var(--success-color); color: white; border: none; border-radius: 0.375rem; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
        .submit-btn:hover, .success-card button:hover { background-color: #157347; }
        .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 1rem; }
        .slot-btn { padding: 0.75rem; border: 1px solid var(--primary-color); background-color: #fff; color: var(--primary-color); border-radius: 0.375rem; cursor: pointer; font-weight: 600; transition: all 0.2s; text-align: center; }
        .slot-btn:hover { background-color: #e6f2ff; }
        .slot-btn.selected { background-color: var(--primary-color); color: white; transform: translateY(-2px); box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.1); }
        
        /* --- Messages and Cards --- */
        .error-message { color: var(--error-color); background-color: #f8d7da; padding: 1rem; border-radius: 0.375rem; text-align: center; margin: 1rem 0; }
        .success-card { text-align: center; padding: 3rem; }
        .success-card h2 { color: var(--success-color); }

        /* --- Login Page --- */
        .login-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
        .login-card { width: 100%; max-width: 420px; }
        .login-card h2 { text-align: center; }
        .login-info { background-color: #e9ecef; padding: 1rem; margin-top: 1.5rem; border-radius: 0.375rem; font-size: 0.9rem; color: var(--muted-text-color); }
        .login-info p { margin: 0.5rem 0; }
        
        /* --- Main App Header --- */
        .app-header { background-color: var(--card-background); padding: 1rem 0; border-bottom: 1px solid var(--light-gray); box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075); }
        .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 800px; margin: 0 auto; padding: 0 2rem; }
        .header-content strong { color: var(--primary-color); }
        .logout-btn { background-color: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 600; transition: background-color 0.2s; }
        .logout-btn:hover { background-color: var(--primary-hover); }

        /* --- Doctor View Schedule --- */
        .schedule-header { display: flex; justify-content: space-between; padding: 0.75rem 1.25rem; background-color: #f8f9fa; border-bottom: 2px solid var(--light-gray); font-weight: 600; color: var(--muted-text-color); border-radius: var(--card-border-radius) var(--card-border-radius) 0 0; margin: -2rem -2rem 0 -2rem; }
        .schedule-list { list-style: none; padding: 0; }
        .schedule-list li { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--light-gray); }
        .schedule-list li:last-child { border-bottom: none; }
        .schedule-header .time, .schedule-list .time { width: 100px; }
        .schedule-header .patient, .schedule-list .patient { flex-grow: 1; text-align: left; padding: 0 1rem; font-weight: 500;}
        .schedule-header .service, .schedule-list .service { width: 150px; text-align: right; color: var(--muted-text-color); }
    `}</style>
);

export default App;