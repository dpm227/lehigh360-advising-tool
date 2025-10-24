import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GoBack from './GoBack.js';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const MeetingDetails = () => {
  const { email } = useParams();
  const [studentInfo, setStudentInfo] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showEmailInputFor, setShowEmailInputFor] = useState(null);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, [email]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/recordings/${email}`, {
        method: 'POST',
      });
      const data = await response.json();
      setStudentInfo(data.student_info || {});
      setSummary(data.summary || []);
    } catch (error) {
      console.error("Failed to load student data:", error);
      setMessage("Failed to load student data.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordingId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/recordings/${recordingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSummary(prev => prev.filter(rec => rec.id !== recordingId));
        setMessage("✅ Recording deleted successfully.");
        setMessageType("success");
      } else {
        throw new Error("Failed to delete recording.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("❌ Could not delete recording.");
      setMessageType("error");
    } finally {
      setEditingId(null);
    }
  };

  const handleSendEmail = async (recording, targetEmail) => {
    if (!targetEmail || !targetEmail.includes("@")) {
      setMessage("❌ Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("student_email", targetEmail);
      formData.append("advisor_email", studentInfo.email); // Assuming this is the source
      formData.append("summary", recording.summary);
      formData.append("program", recording.program);
      formData.append("date", new Date(recording.timestamp).toLocaleString());

      const response = await fetch(`${BACKEND_URL}/recordings/send_email`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Failed to send email");
      const result = await response.json();

      if (result.data) {
        setMessage(`📬 Email sent to ${targetEmail}`);
        setMessageType("success");
        setShowEmailInputFor(null);
        setEmailInput('');
      } else {
        throw new Error("Email API failed.");
      }
    } catch (error) {
      console.error("Email error:", error);
      setMessage("❌ Failed to send email.");
      setMessageType("error");
    }
  };

  if (loading) return <div className="message">Loading meeting details...</div>;

  return (
    <section className="meeting-details-page" style={{ padding: "24px" }}>
      <div className="back-button-wrapper" style={{ textAlign: "center", marginBottom: "20px" }}>
        <GoBack />
      </div>

      <h2 className="page-title" style={{ textAlign: "center", marginBottom: "12px" }}>
        Meeting Details for <strong>{studentInfo?.name || 'Student'}</strong>
      </h2>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <section className="student-info-section" style={{ marginBottom: "24px" }}>
        <table className="tbl-stu-info" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Year</th>
              <th>Major</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{studentInfo?.email || 'N/A'}</td>
              <td>{studentInfo?.name || 'N/A'}</td>
              <td>{studentInfo?.year || 'N/A'}</td>
              <td>{studentInfo?.major || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="recordings-section">
        <h3 style={{ textAlign: "center", marginBottom: "12px" }}>Meeting Summaries</h3>
        {summary.length === 0 ? (
          <p className="message">No meeting summaries available.</p>
        ) : (
          <div className="table-wrapper">
            <table className="tbl-recordings">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date & Time</th>
                  <th>Program</th>
                  <th>Summary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((rec) => (
                  <tr key={rec.id}>
                    <td>{rec.id}</td>
                    <td>{new Date(rec.timestamp).toLocaleString()}</td>
                    <td>{rec.program}</td>
                    <td>{rec.summary}</td>
                    <td>
                      {editingId === rec.id ? (
                        <>
                          <button className="delete-btn" onClick={() => handleDelete(rec.id)}>
                            Delete
                          </button>
                          <button className="cancel-btn" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="edit-btn" onClick={() => setEditingId(rec.id)}>
                            Edit
                          </button>
                          <button className="edit-btn" onClick={() => setShowEmailInputFor(rec.id)}>
                            Email
                          </button>
                        </>
                      )}
                      {showEmailInputFor === rec.id && (
                        <div style={{ marginTop: "8px" }}>
                          <input
                            type="email"
                            placeholder="Enter email address"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            style={{ padding: "4px", marginRight: "6px" }}
                          />
                          <button
                            className="edit-btn"
                            onClick={() => handleSendEmail(rec, emailInput)}
                          >
                            Send
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default MeetingDetails;
