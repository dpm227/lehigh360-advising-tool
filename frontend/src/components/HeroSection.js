import React from 'react';

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero1">
        <h1>Advising Notes AI Assistant</h1>
        <div className="note">
          <p>
            This tool allows you to record a student meeting either by using
            the start button on the page for live transcription or pasting meeting notes in the text box.
          </p>
        </div>
      </div>
      <div className="hero2">
        <div className="main-btn">
          <form action="/record_meeting">
            <button id="record">Record Live Meeting</button>
          </form>
        </div>
        <div className="second-btn">
          <button id="upload">
            <a href="/upload_recording">Upload a Recording</a>
          </button>
          <button id="type">
            <a href="/type_notes">Type Meeting Notes</a>
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;