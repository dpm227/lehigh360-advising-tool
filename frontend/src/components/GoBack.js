import React from 'react';
import { useNavigate } from 'react-router-dom';

function GoBack() {
  const navigate = useNavigate();

  return (
    <section className="go-back">
      <button className="rcd-btn" onClick={() => navigate("/")}>
        Cancel and Go Back
      </button>
    </section>
  );
}

export default GoBack;
