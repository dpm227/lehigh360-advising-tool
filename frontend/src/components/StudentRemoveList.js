import React, { useEffect, useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function StudentRemoveList({ authId }) {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [loading, setLoading] = useState(true);

  const removeStudent = async (student) => {
    const formData = new FormData();
    formData.append('email', student.email);
    formData.append('name', student.name);
    formData.append('major', student.major);
    formData.append('year', student.year);

    try {
      const response = await fetch(`${BACKEND_URL}/remove_student`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.text();
      console.log(data);

      setStudents(prevStudents => prevStudents.filter(s => s.email !== student.email));
      setMessage(`✅ Successfully removed ${student.name}`);
      setMessageType('success');
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error occurred while removing the student.');
      setMessageType('error');
    }
  };

  useEffect(() => {
    if (!authId) return;

    setLoading(true);
    fetch(`${BACKEND_URL}/get_students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authId,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch students');
        return response.json();
      })
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
        setMessage('❌ Could not fetch student list.');
        setMessageType('error');
        setLoading(false);
      });
  }, [authId]);

  return (
    <section className="history">
      <h1>All Students</h1>

      {/* Message Box */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Spinner */}
      {loading ? (
        <div className="spinner-container">
          <ClipLoader color="#333" size={50} />
        </div>
      ) : (
        <ul className="stud-cards">
          {students.map((student, index) => (
            <li key={index} className="stud-card">
              <form className="stud-card-form" onSubmit={(event) => {
                event.preventDefault();
                removeStudent(student);
              }}>
                <ul>
                  <li className="name">{student.name}</li>
                  <li className="major">{student.major}</li>
                  <li className="year">{student.year}</li>
                  <li className="email">{student.email}</li>
                </ul>
                <button type="submit">Remove Student</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default StudentRemoveList;
