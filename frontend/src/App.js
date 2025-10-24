import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import RecordMeeting from './components/RecordMeeting';
import UploadMeeting from "./components/UploadMeeting";
import TypeNotes from "./components/TypeNotes";
import AddStudent from "./components/AddStudent";
import MeetingDetails from "./components/MeetingDetails";
import RemoveStudent from "./components/RemoveStudent";
import AuthCallback from './components/AuthCallback';

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function App() {
  const [authId, setAuthId] = useState(""); // State to hold auth_id

  useEffect(() => {
    // Retrieve auth_id from local storage
    const storedAuthId = localStorage.getItem('auth_id');
    if (storedAuthId) {
      setAuthId(storedAuthId); // Set authId state if it exists
    }

    // Optional: Fetch initial data if needed
    fetch(`${FRONTEND_URL}/`, {
      method: 'GET',
      credentials: 'include', // Include cookies in requests
    });

    //if (!authId && window.location.pathname !== "/callback") {
    //  window.location.href = `${BACKEND_URL}/login`;
    //  return null;
    //}
  }, []);

  return (
    <Router>
      <div className="App">
        <NavBar />
        <div className="wrapper">
          <Routes>
            <Route path="/" element={<HomePage authId={authId} />} />
            <Route path="/callback" element={<AuthCallback />} />
            <Route path="/record_meeting" element={<RecordMeeting authId={authId} />} />
            <Route path="/upload_recording" element={<UploadMeeting authId={authId} />} />
            <Route path="/type_notes" element={<TypeNotes authId={authId} />} />
            <Route path="/add_student" element={<AddStudent authId={authId} />} />
            <Route path="/recordings/:email" element={<MeetingDetails authId={authId} />} />
            <Route path="/remove_student" element={<RemoveStudent authId={authId} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
