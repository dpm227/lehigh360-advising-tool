import React, { useState, useEffect } from 'react';
import RecordBody from './RecordBody.js';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const TypeNotes = ({ authId }) => {
  const [email, setEmail] = useState('');
  const [transcript, setTranscript] = useState('');
  const [infoText, setInfoText] = useState('');
  const [infoType, setInfoType] = useState(''); // 'success' | 'error'

  const uploadNotes = async (event) => {
    event.preventDefault();
    setInfoText('🕐 Meeting transcript processing. Give it a few minutes.');
    setInfoType('');

    const payload = { email, transcript };

    try {
      const response = await fetch(`${BACKEND_URL}/recordings/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setTranscript('');

      if (data.success) {
        setInfoText('✅ Transcript recorded successfully.');
        setInfoType('success');
      } else {
        setInfoText('❌ Error occurred during transcript processing.');
        setInfoType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setInfoText('❌ A network error occurred. Please try again.');
      setInfoType('error');
    }
  };

  // Optional: clear messages after a few seconds
  useEffect(() => {
    if (infoText) {
      const timeout = setTimeout(() => {
        setInfoText('');
        setInfoType('');
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [infoText]);

  return (
    <div className="record-body">
      <div className="record_meeting">
        <RecordBody email={email} setEmail={setEmail} />
        <section className="new-recording">
          <h1 id="instructions">Type Notes Below</h1>

          {/* Message box */}
          {infoText && (
            <div className={`message ${infoType}`}>{infoText}</div>
          )}

          <div className="record-btn">
            <textarea
              id="textbox"
              rows="6"
              cols="100"
              className="form-control"
              placeholder="Meeting Notes"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            ></textarea>

            <button
              id="record-btn"
              className="btn btn-danger btn-block rcd-btn"
              onClick={uploadNotes}
            >
              Upload Notes
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TypeNotes;
