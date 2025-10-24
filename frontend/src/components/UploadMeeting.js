import React, { useState, useEffect } from 'react';
import RecordBody from './RecordBody.js';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const UploadMeeting = ({ authId }) => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [infoText, setInfoText] = useState('');
  const [infoType, setInfoType] = useState(''); // 'success' | 'error'

  const uploadFile = async (event) => {
    event.preventDefault();

    if (!file) {
      setInfoText('❗ Please select a file before uploading.');
      setInfoType('error');
      return;
    }

    setInfoText('🕐 Meeting transcript processing. Give it a few minutes...');
    setInfoType('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/upload_recording`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': authId,
        },
      });

      const data = await response.text();
      console.log(data);

      if (data === 'True') {
        setInfoText('✅ Transcript recorded successfully. You can safely go back.');
        setInfoType('success');
        setFile(null);
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

  useEffect(() => {
    if (infoText) {
      const timer = setTimeout(() => {
        setInfoText('');
        setInfoType('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [infoText]);

  return (
    <div className="record-body">
      <div className="record_meeting">
        <RecordBody email={email} setEmail={setEmail} />
        <section className="new-recording">
          <h1 id="instructions">Upload a File Here</h1>

          {/* ✅ Message Box */}
          {infoText && (
            <div className={`message ${infoType}`}>{infoText}</div>
          )}

          <div className="record-btn">
            <form method="POST" encType="multipart/form-data" className="upload-file-form">
              <div className="upload-box">
                <label htmlFor="file-upload">Select an audio file</label>
                <input
                  type="file"
                  accept="audio/*, video/*"
                  id="file-upload"
                  name="file"
                  onChange={(event) => setFile(event.target.files[0])}
                />
              </div>
              <button
                id="upload-btn"
                className="btn btn-danger btn-block rcd-btn"
                onClick={uploadFile}
              >
                Upload File
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UploadMeeting;
