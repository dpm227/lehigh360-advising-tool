import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function StudentHistory({ authId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authId) return;

    setLoading(true);
    fetch(`${BACKEND_URL}/get_students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${authId}`
      },
    })
      .then(response => response.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
        setLoading(false);
      });
  }, [authId]);

  return (
    <section className="history">
      <h1>Student Meeting History</h1>

      {loading ? (
        <div className="spinner-container">
          <ClipLoader color="#333" size={50} />
        </div>
      ) : students.length === 0 ? (
        <p className="no-meetings-text">
          No meetings yet. Press the <strong>Record Live Meeting</strong> button to get started.
        </p>
      ) : (
        <ul className="stud-cards">
          {students.map((student, index) => (
            <li key={index} className="stud-card">
              <form className="stud-card-form">
                <ul>
                  <li className="name">{student.name}</li>
                  <li className="major">{student.major}</li>
                  <li className="year">{student.year}</li>
                  <li className="email">{student.email}</li>
                </ul>
              </form>
              <Link to={`/recordings/${student.email}`}>
                <button type="button">See Meeting Details</button>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="stud-operations">
        <form action="/remove_student">
          <button type="submit">Remove a Student</button>
        </form>
        <form action="/add_student">
          <button type="submit">Add New Student</button>
        </form>
      </div>
    </section>
  );
}

export default StudentHistory;
