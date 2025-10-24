import React from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const Navbar = ({ session }) => {
  return (
    <nav>
      <h1>
        <Link to="/">advising tool (Alpha version)</Link>
      </h1>
      {session && (
        <h1>
          <Link to="/">Welcome {session.userinfo.name}!</Link>
        </h1>
      )}
      <div className="auth-links">
        <p>
          {/* Always show the logout link */}
          <Link to={`${BACKEND_URL}/logout`} id="qsLogoutBtn">Logout</Link>
        </p>
      </div>
    </nav>
  );
};

export default Navbar;