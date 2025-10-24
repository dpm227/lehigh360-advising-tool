import React, { useState, useEffect } from 'react';
import GoBack from './GoBack';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const RecordBody = ({ email, setEmail }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'

  const find_student = (email) => {
    fetch(`${BACKEND_URL}/find_student/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.text())
      .then(data => {
        if (data === 'True') {
          setFeedback('✅ Student found! You can start recording.');
          setFeedbackType('success');
          setEmail(email); // update parent email
        } else {
          setFeedback('⚠️ Student not found. Try adding the student instead.');
          setFeedbackType('error');
          setSearchEmail('');
        }
      })
      .catch(error => {
        console.error(error);
        setFeedback('An error occurred while searching for the student.');
        setFeedbackType('error');
      });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchEmail.trim() === '') {
      setFeedback('Please enter an email to search.');
      setFeedbackType('error');
      return;
    }
    find_student(searchEmail.trim());
  };

  // Optional: Clear feedback after a few seconds
  useEffect(() => {
    if (feedback) {
      const timeout = setTimeout(() => {
        setFeedback('');
        setFeedbackType('');
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [feedback]);

  return (
    <section>
      <GoBack />
      <section className="stud-name">
        <form className="search-stud" onSubmit={handleSearchSubmit}>
          <label>Find your Student by Email</label>
          <input
            type="text"
            id="search-email"
            placeholder="aaa004"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <button type="submit">Find Student</button>
        </form>

        {/* Feedback Message */}
        {feedback && (
          <div className={`message ${feedbackType}`}>{feedback}</div>
        )}

        <form action="/add_student">
          <p>If the student is new, add the student below</p>
          <button type="submit">Add New Student</button>
        </form>
      </section>

      <section className="notes">
        <p>
          Ensure that you outline the key points that you would like captured. A general guide of what to include may be:
        </p>
        <ul>
          <li>A brief overview of the session, including key concerns or topics covered, and goals discussed</li>
          <li>Any notable progress or setbacks</li>
          <li>Significant changes to the student's presentation or new contextual information</li>
          <li>Any action items assigned to the student</li>
          <li>Any next steps or plans for future advising meetings</li>
        </ul>
      </section>
    </section>
  );
};

export default RecordBody;
