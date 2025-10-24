import React, { useState } from 'react';
import GoBack from './GoBack.js';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const AddStudent = ({ authId }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    major: '',
    year: 'Freshman',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email) => {
    // Must be 3 lowercase letters + 3 digits (e.g. abc123)
    return /^[a-z]{3}\d{3}$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const { email, name, major } = formData;
    if (!validateEmail(email)) {
      return setError("❌ Email must be 3 lowercase letters followed by 3 digits (e.g. abc123).");
    }
    if (!name.trim() || !major.trim()) {
      return setError("❌ All fields are required.");
    }

    const payload = new FormData();
    payload.append("auth_id", authId);
    Object.entries(formData).forEach(([key, val]) => payload.append(key, val));

    fetch(`${BACKEND_URL}/add_student`, {
      method: "POST",
      body: payload,
    })
      .then((res) => {
        if (res.ok) {
          setSuccess("✅ Student added successfully!");
          setFormData({ email: '', name: '', major: '', year: 'Freshman' });
        } else {
          setError("❌ Failed to add student.");
        }
      })
      .catch(() => setError("❌ Network error. Please try again."));
  };

  return (
    <div className="record-body">
      <div className="record_meeting">
        <GoBack />
        <section className="new-recording">
          <div className="add-stud-section">
            <h1>Add a New Student</h1>
            <p style={{ marginBottom: '12px', color: '#666' }}>
              👉 Use only the 3 letters + 3 numbers from the Lehigh email (e.g. <code>abc123</code>), not the full <code>@lehigh.edu</code> address.
            </p>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <form className="add-stud-form" onSubmit={handleSubmit}>
              <input type="hidden" name="auth_id" value={authId} />

              <div className="email-section">
                <label>Student Email</label>
                <input
                  type="text"
                  name="email"
                  placeholder="e.g. abc123"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="name-section">
                <label>Student Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="major-section">
                <label>Major</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="year-section">
                <label>Year Group</label>
                <select name="year" value={formData.year} onChange={handleChange} className="years-dropdown">
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div className="record-btn">
                <button id="record-btn" className="btn btn-danger btn-block rcd-btn">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AddStudent;
