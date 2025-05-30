import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home (User Dashboard)</Link>
        </li>
        {!isAuthenticated ? (
          <li>
            <Link to="/login">Login</Link>
          </li>
        ) : (
          <>
            {user &&
              user.is_admin && ( // Check if user exists and is_admin
                <li>
                  <Link to="/admin">Admin Dashboard</Link>
                </li>
              )}
            <li>
              <button onClick={handleLogout}>Logout ({user?.username})</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
