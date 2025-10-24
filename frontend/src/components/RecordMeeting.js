import React, { useState, useRef, useEffect } from 'react';
import RecordBody from './RecordBody.js';

const RecordMeeting = ({ authId }) => {
    const [email, setEmail] = useState('');
    const [program, setProgram] = useState('');
    const [transcript, setTranscript] = useState('');
    const [instructionsText, setInstructionsText] = useState('Press the Start Button');
    const [infoText, setInfoText] = useState('');
    const [infoType, setInfoType] = useState('');
    const recognitionRef = useRef(null);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const text = event.results[current][0].transcript;
                setTranscript(prev => prev + text + " ");
            };
        } else {
            setInfoText("Speech recognition is not supported in your browser.");
            setInfoType('error');
        }
    }, []);

    const startRecording = () => {
        recognitionRef.current?.start();
        setInstructionsText('Recording Started');
    };

    const pauseRecording = () => {
        recognitionRef.current?.stop();
        setInstructionsText("Recording Paused");
    };

    const finishRecording = async (e) => {
        e.preventDefault();
        setInfoText('🕐 Meeting transcript processing. Give it a few moments...');
        setInfoType('');

        const formData = new FormData();
        formData.append('email', email);
        formData.append('transcript', transcript);
        formData.append('program', program); // ✅ include program

        try {
            const response = await fetch(`${BACKEND_URL}/recordings/transcript`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': authId,
                },
            });

            const data = await response.text();
            setTranscript('');
            setProgram('');

            if (data === 'True') {
                setInfoText('✅ Transcript recorded successfully. You can safely go back.');
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

    return (
        <div className="record-body">
            <div className="record_meeting">
                <RecordBody email={email} setEmail={setEmail} />

                <section className="new-recording">
                    <h1>{instructionsText}</h1>

                    {infoText && (
                        <div className={`message ${infoType}`}>{infoText}</div>
                    )}

                    {/* Program input */}
                    <input
                        type="text"
                        id="program-input"
                        className="form-control program-input"
                        placeholder="Enter Program Title"
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                    />

                    <div className="record-btn">
                        <textarea
                            id="textbox"
                            rows="6"
                            cols="100"
                            className="form-control"
                            placeholder="Live transcription"
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            onInput={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height = `${e.target.scrollHeight}px`;
                              }}                              
                        ></textarea>
                    </div>

                    <button
                        id="start-btn"
                        className="btn btn-danger btn-block rcd-btn"
                        onClick={startRecording}
                    >
                        Start Recording
                    </button>

                    <button
                        id="stop-btn"
                        className="btn btn-danger btn-block rcd-btn"
                        onClick={pauseRecording}
                    >
                        Pause Recording
                    </button>

                    <form className="finish-meeting-form" onSubmit={finishRecording}>
                        <button id="record-btn" className="btn btn-danger btn-block rcd-btn">
                            Finish Meeting
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default RecordMeeting;
